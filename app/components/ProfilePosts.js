import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LodingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { signal: controller.signal })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("there was a problem or the request was cannceled" + error)
      }
    }
    fetchPosts()

    return () => {
      controller.abort()
    }
  }, [username])

  if (isLoading) {
    return <LodingDotsIcon />
  }

  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
