import React from 'react'
import "./HomePage.css"
import {NavBar} from '../Components'
import {Footer, MusicApp} from '../Container';

const HomePage = () => {
  return (
    <>
      <div className="bg-black h-screen">
        <NavBar />
        <MusicApp />
      </div>
    </>
  );
}

export default HomePage