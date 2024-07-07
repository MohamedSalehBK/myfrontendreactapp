import React, { useContext, useEffect } from "react"
import Page from "./Page"
import StateContext from "../StateContext"
import { useImmer } from "use-immer"
import LodingDotsIcon from "./LoadingDotsIcon"
import Axios from "axios"
import Post from "./Post"

function Home() {
  const appState = useContext(StateContext)

  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  })
  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      try {
        const response = await Axios.post("/getHomeFeed", { token: appState.user.token }, { signal: controller.signal })
        setState(draft => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (error) {
        console.log("there was a problem or the request was canclled!" + error)
      }
    }
    fetchData()
    return () => {
      controller.abort()
    }
  }, [])
  if (state.isLoading) {
    ;<LodingDotsIcon />
  }
  return (
    <Page title="Your Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">The Latest from those You Follow</h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you dont have any friends to follow thats okay you can use the Search feature in the top menu bar to find content written by people similar interests and then follow them</p>
        </>
      )}
    </Page>
  )
}

export default Home
