import React, { useEffect, useState } from "react";
import client from "../../lib/client";
import Profile from "../../assets/profile.jpg";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [navItem, setNavItem] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    client
      .fetch(
        `
    *[_type == "navbar"]{
      title,
      logo{
        asset->{
          url
        },
      },
      language,
    }
    `
      )
      .then((res) => {
        setNavItem(res[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() =>{
    console.clear()
  },[])
  return (
    <>
      <header className="text-[#fff] body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center w-[80%]">
          <a className="flex title-font font-medium items-center mb-4 md:mb-0">
            <img src={navItem?.logo?.asset?.url} alt="Logo" className="w-[15rem]" />
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center uppercase transition-all duration-300">
            <a className="mr-5 hover:text-[#2bc5b4] cursor-pointer" onClick={() => {navigate(`/login`)}}>
              <img src={Profile} alt="profile" className="rounded-[50%] h-[5rem] w-[5rem] object-cover" />
            </a>
          </nav>
        </div>
      </header>
    </>
  );
};

export default NavBar;
