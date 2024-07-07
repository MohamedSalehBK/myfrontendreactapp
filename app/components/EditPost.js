import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import { useParams, Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import LodingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isfetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isfetching = false
        return
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "You msut provide a Title"
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "You msut provide a body"
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function SubmitHandler(e) {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value })
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { signal: controller.signal })
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You are not allowed to edit this post" })
            //redirect to home Page
            navigate("/")
          }
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (error) {
        console.log("there was a a problem or request was cancelled." + error)
      }
    }
    fetchPost()
    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const controller = new AbortController()
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { signal: controller.signal })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post was updated." })
        } catch (error) {
          console.log("there was a a problem or request was cancelled." + error)
        }
      }
      fetchPost()
      return () => {
        controller.abort()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isfetching)
    return (
      <Page title="...">
        <LodingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>
      <form className="mt-3" onSubmit={SubmitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default EditPost
