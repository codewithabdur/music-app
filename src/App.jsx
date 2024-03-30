import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage, Error } from './Container'

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><HomePage /></>
  },
  {
    path: "*",
    element: <Error />
  }
  ])
  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App