import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { PiEyeClosedDuotone } from "react-icons/pi";
import { FaHome } from "react-icons/fa";
import { TiEye } from "react-icons/ti";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  })
  const [isLoading,setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()


  const postUserData = (e)=> {
    const { name, value } = event.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
  }

  const submitData = async (e) =>{
     e.preventDefault();
    setIsLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Store user information in local storage
      localStorage.setItem(
        "user",
        JSON.stringify(userCredential.user.auth.lastNotifiedUid)
      );
      localStorage.removeItem("verifiedPhone");
      setIsLoading(false);
      navigate(`/`);
    } catch (error) {
      console.error("Error logging in:", error.message);
      setIsLoading(false);
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  }

  const toogleEye = () =>{
    setEyeOpen(!eyeOpen)
  }
  
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
                        May be internet issue or email or password is inCorrect.
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
        <div className="fixed md:top-4 md:left-4 text-[#02eda7] text-[35px] hover:text-[#62fff5] transition-all duration-[.3s] bottom-4 right-4 cursor-pointer">
          <FaHome
            onClick={() => {
              navigate(`/`);
            }}
          />
        </div>
        <div className="flex justify-center items-center min-h-screen w-[80%] mx-auto">
          <form className="bg-gray-900 opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
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
                placeholder="example@gmail.com"
                name="email"
                value={userData.email}
                required
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
            <div className="flex items-center justify-between pt-4">
              <button
                className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                type="button"
                onClick={(e) => {
                  submitData(e);
                }}
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
              <button
                className="bg-gradient-to-r from-purple-800 to-green-500 hover:from-pink-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                type="button"
                onClick={() => {
                  navigate(`/phoneAuth`);
                }}
              >
                Register Here
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login