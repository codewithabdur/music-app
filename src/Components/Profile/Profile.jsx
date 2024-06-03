import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { DNA } from "react-loader-spinner";
import { signOut } from "firebase/auth";

const Profile = () => {
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("user");

useEffect(() => {
  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Fetch the user document from Firestore based on the 'email' field
      const usersCollectionRef = collection(db, "users");
      const q = query(
        usersCollectionRef,
        where("email", "==", email)
      );
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
        console.clear()
      }
    }
  };
  // Call the function immediately
  fetchUserData();
}, []);


  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("uid");
    localStorage.removeItem("verifiedPhone");
    localStorage.removeItem("liked");
    localStorage.removeItem("playlist");
    localStorage.removeItem("history");
    // Sign out the user
    signOut(auth)
      .then(() => {
        // Navigate to home page after successful sign out
        navigate(`/`);
      })
      .catch((error) => {
        // Handle any errors during sign out
        console.error("Error signing out: ", error);
      });
  };

  return (
    <>
      {userData.length === 0 ? (
        <div className="h-screen w-full flex bg-[#000] justify-center items-center">
          <DNA
            visible={true}
            height="150"
            width="150"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperclassName="dna-wrapper"
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen text-[#fff] bg-[#000]">
          <div className="md:min-w-[60vw] min-w-[90vw] p-4 bg-[#2f2f2f] rounded shadow-md">
            <div className="flex justify-center mb-4">
              <img
                src={userData?.image}
                alt="Profile Image"
                className="w-24 h-24 rounded-full object-cover"
                loading="lazy"
              />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-center">
              {userData.fullName}
            </h1>
            <p className="text-[#e3e3e3] text-center mb-4">
              {userData.userName}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#767676] rounded-md">
                <h2 className="text-lg font-bold mb-2">Address</h2>
                <ul className="list-none">
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">City:</span>
                    <span>{userData.city}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">Country:</span>
                    <span>{userData.country}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">District:</span>
                    <span>{userData.district}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">Zip Code:</span>
                    <span>{userData.zipCode}</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-[#767676] rounded-md">
                <h2 className="text-lg font-bold mb-2">Contact Info</h2>
                <ul className="list-none">
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">Email:</span>
                    <span>{userData.email}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#4af2f2] mr-2">Phone:</span>
                    <span>
                      {userData.phoneNumber ? userData.phoneNumber : "Null"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex md:flex-row flex-col justify-between min-w-[90vw] md:min-w-[60vw] md:gap-0 gap-3 mx-auto p-6 cursor-pointer">
            <div className="logOutButton" onClick={logout}>
              <span>Log Out</span>
              <div className="top"></div>
              <div className="left"></div>
              <div className="bottom"></div>
              <div className="right"></div>
            </div>
            <div
              className="homePagebutton cursor-pointer flex items-center"
              onClick={() => navigate(`/`)}
            >
              Homepage
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
