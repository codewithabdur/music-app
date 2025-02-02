import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiEyeClosedDuotone } from "react-icons/pi";
import { TiEye } from "react-icons/ti";
import { FaHome } from "react-icons/fa";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const defaultProfileImageURL =
  "https://icons8.com/icon/tZuAOUGm9AuS/user-default";

const Register = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [dataFilled, setDataFilled] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [file, setFile] = useState(defaultProfileImageURL);
  const [userData, setUserData] = useState({
    fullName: "",
    userName: "",
    zipCode: "",
    city: "",
    district: "",
    number: "",
    country: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const verifiedPhone = localStorage.getItem("verifiedPhone");

  const toogleEye = () => {
    setEyeOpen(!eyeOpen);
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const newProfileImage = selectedFile
      ? URL.createObjectURL(selectedFile)
      : defaultProfileImageURL;

    setUserData((prevUserData) => ({
      ...prevUserData,
      profileImage: selectedFile, // Store the selected file
    }));

    setFile(newProfileImage);
  };

  const postUserData = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const submitData = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    // Check if any of the fields in the userData object is empty
   const isAnyFieldEmpty = Object.values(userData).some(
     (value) => typeof value === "string" && value.trim() === ""
   );

    if (isAnyFieldEmpty) {
      setDataFilled(true);
      setTimeout(() => {
        setDataFilled(false);
      }, 2000);
      setIsLoading(false);
    } else {
      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        // Only upload the image if it's selected
        if (userData.profileImage) {
          const storage = getStorage();
          const storageRef = ref(
            storage,
            `Profile Image/${userCredential.user.uid}`
          );
          await uploadBytes(storageRef, userData.profileImage);

          const imageURL = await getDownloadURL(storageRef);

          const db = getFirestore();
          const userDocRef = doc(db, "users", userCredential.user.uid);
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            fullName: userData.fullName,
            userName: userData.userName,
            zipCode: userData.zipCode,
            phoneNumber: userData.number,
            city: userData.city,
            district: userData.district,
            country: userData.country,
            email: userData.email,
            password: userData.password,
            image: imageURL,
          });
      setIsLoading(false)
      setRegistered(true);
      setTimeout(() => {
        setRegistered(false);
      }, 2000);
        } else {
          // If no image is selected, store user data without profileImage
          const db = getFirestore();
          const userDocRef = doc(db, "users", userData.fullName);
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            fullName: userData.fullName,
            userName: userData.userName,
            zipCode: userData.zipCode,
            phoneNumber: userData.number,
            city: userData.city,
            district: userData.district,
            country: userData.country,
            email: userData.email,
            password: userData.password,
          });
        }
      setRegistered(true);
      setTimeout(() => {
        setRegistered(false);
      }, 2000);
        setIsLoading(false);
        navigate(`/login`);
      } catch (error) {
        console.error("Error creating user:", error);
        setIsLoading(false);
        setError(true);
        setTimeout(() => {
          setError(false);
      },2000)
      }
      console.log(userData);
      // Proceed with form submission
    }
  };

  return (
    <>
      {/* -------------------------------Banner----------------------------- */}
      {error && (
        <div className="absolute top-1 right-1 z-10">
          <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
          >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
              <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-red-600 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-white">
                        Some Error Occured
                      </p>
                      <p className="mt-1 text-sm text-[#c1c1c1]">
                        May be user already exist or internet issue.
                      </p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed md:top-4 md:left-4 text-[#02eda7] text-[35px] hover:text-[#62fff5] transition-all duration-[.3s] bottom-4 right-4 cursor-pointer">
        <FaHome
          onClick={() => {
            navigate(`/`);
          }}
        />
      </div>

      {dataFilled && (
        <div className="absolute top-1 right-1 z-10">
          <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
          >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
              <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-red-600 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-white">
                        Please Fill All Details
                      </p>
                      <p className="mt-1 text-sm text-[#c1c1c1]">
                        May be Some Field is not filled.
                      </p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------Banner----------------------------- */}
      {/* -------------------------------Banner----------------------------- */}

      {registered && (
        <div className="absolute top-1 right-1 z-10">
          <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
          >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
              <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-gray-900">
                        Successfully Register!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Your Data is SuccessFully Saved.
                      </p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* -------------------------------Banner----------------------------- */}
      <div className="bg-black">
        <div className="flex justify-center items-center min-h-screen w-[80%] mx-auto">
          <form className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="image"
              >
                Image
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="emailaddress"
              >
                Email Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="emailaddress"
                type="email"
                placeholder="you@somewhere.com"
                required
                name="email"
                value={userData.email}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                  id="password"
                  type={!eyeOpen ? "password" : "text"}
                  placeholder="**********"
                  required
                  name="password"
                  value={userData.password}
                  onChange={(e) => {
                    postUserData(e);
                  }}
                />
                {eyeOpen ? (
                  <TiEye
                    className="text-[#111] absolute top-2 right-1 text-[30px] cursor-pointer"
                    onClick={toogleEye}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="text-[#111] absolute top-2 right-1 text-[30px] cursor-pointer"
                    onClick={toogleEye}
                  />
                )}
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="fullName"
                type="text"
                placeholder="Enter Your Full Name here.."
                required
                name="fullName"
                value={userData.fullName}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="userName"
              >
                User Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="userName"
                type="text"
                placeholder="Enter Your User Name here.."
                required
                name="userName"
                value={userData.userName}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="zipCode"
              >
                Zip Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="zipCode"
                type="text"
                placeholder="Enter Your Zip Code.."
                required
                name="zipCode"
                value={userData.zipCode}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="city"
              >
                City
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="city"
                type="text"
                placeholder="Enter Your City Name here.."
                required
                name="city"
                value={userData.city}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="district"
              >
                District
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="district"
                type="text"
                placeholder="Enter Your District Name here.."
                required
                name="district"
                value={userData.district}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="country"
              >
                Country
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="country"
                type="text"
                placeholder="Enter Your District Name here.."
                required
                name="country"
                value={userData.country}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-blue-300 py-2 font-bold mb-2"
                htmlFor="phoneNumber"
              >
                Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:ring transform transition hover:scale-[1.01] duration-300 ease-in-out"
                id="phoneNumber"
                type="text"
                placeholder="Enter Your Phone Number here.."
                required
                name="number"
                value={userData.number}
                onChange={(e) => {
                  postUserData(e);
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <button
                className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                type="button"
                onClick={(e) => {
                  submitData(e);
                }}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
              <button
                className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                type="button"
                onClick={() => {
                  navigate(`/login`);
                }}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
