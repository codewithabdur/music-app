import React, { useEffect, useState } from "react";
import client from "../../lib/client";
import Profile from "../../assets/profile.jpg";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../lib/firebase"; // Removed unnecessary storage import
import { collection, query, where, getDocs } from "firebase/firestore";

const NavBar = () => {
  const [navItem, setNavItem] = useState([]);
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem("user")!= null
  const [userData , setUserData] = useState([])
  const uid = localStorage.getItem("uid")
  const email = localStorage.getItem("user")

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

 useEffect(() => {
   const fetchUserData = async () => {
     const currentUser = auth.currentUser;
     if (currentUser) {
       // Fetch the user document from Firestore based on the 'email' field
       const usersCollectionRef = collection(db, "users");
       const q = query(usersCollectionRef, where("email", "==", email));
       const querySnapshot = await getDocs(q);

       if (!querySnapshot.empty) {
         // If the query result is not empty, there is a matching user
         const userData = querySnapshot.docs[0].data();
         setUserData(userData);

         // Fetch the user's profile image from Storage
         if (userData.img) {
           const imageRef = ref(storage, userData.img);
           const imageUrl = await getDownloadURL(imageRef);
           setProfileImage(imageUrl);
         }
       } else {
         // Handle the case where no matching user is found
         console.error("No matching user found");
         console.clear();
       }
     }
   };
   // Call the function immediately
   fetchUserData();
 }, []);

  return (
    <>
      <header className="text-[#fff] body-font bg-[#000] ">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center w-[80%]">
          <a className="flex title-font font-medium items-center mb-4 md:mb-0">
            <img
              src={navItem?.logo?.asset?.url}
              alt="Logo"
              className="w-[15rem]"
              loading="lazy"
            />
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center uppercase transition-all duration-300">
            <a
              className="mr-5 hover:text-[#2bc5b4] cursor-pointer"
              onClick={() => {
                {
                  isLoggedIn ? navigate(`/profile/${uid}`) : navigate(`/login`);
                }
              }}
            >
              <img
                src={Profile}
                alt="profile"
                className="rounded-[50%] h-[5rem] w-[5rem] object-cover"
                loading="lazy"
              />
            </a>
          </nav>
        </div>
      </header>
    </>
  );
};

export default NavBar;
