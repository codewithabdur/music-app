import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {  Error, History, Playlist } from './Container'
import HomePage from './HomePage/HomePage'
import { Login, Phone, Profile, Register, NavBar } from './Components'

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <HomePage />
        </>
      ),
    },
    {
      path: "profile",
      element: <Profile />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "phoneAuth",
      element: <Phone />,
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "*",
      element: <Error />,
    },
    {
      path: "history",
      element: (
        <>
          <NavBar />
          <History />
        </>
      ),
    },
    {
      path: "playlistpage",
      element: (
        <>
          <NavBar />
          <Playlist />
        </>
      ),
    },
  ]);
  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App