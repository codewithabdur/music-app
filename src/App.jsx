import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage, Error } from './Container'
import { Login, Profile, Register } from './Components'

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><HomePage /></>
  },
  {
    path: "profile",
    element: <Profile />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "register",
    element: <Register />
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