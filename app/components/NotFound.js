import React from "react"
import Page from "./Page"
import { Link } from "react-router-dom"

function NotFound() {
  return (
    <Page title="Nnot found">
      <div className="text-center">
        <h2>Whoops, we cannot found that post</h2>
        <p className="lead text-muted">
          You can always visit <Link to={"/"}>homepage</Link> to get a fresh start.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
