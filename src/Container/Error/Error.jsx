import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import error from "../../assets/error.png"
import { DNA } from "react-loader-spinner";

const Error = () => {
  const navigate = useNavigate();
  const [active , setActive] = useState(false)

  useEffect(() =>{
    setTimeout(() =>{
      setActive(true)
    },1000)
  },[])
  

  return (
    <>
      {!active ? (
        <div className="h-screen bg-[#000] w-full flex justify-center items-center">
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
        <div className="bg-black min-h-screen flex justify-center items-center">
          <section className="bg-gray-300 dark:bg-gray-700 rounded-lg shadow-lg p-8 md:p-12 lg:p-16">
            <div className="text-center">
              <div className="w-full flex justify-center">
                <img src={error} alt="error" className="mb-4 max-w-[20rem]" loading="lazy"/>
              </div>
              <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-bold mb-4">
                Internal Servor Error!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Sorry, might be broken page or url.{" "}
                <span
                  onClick={() => navigate(`/`)}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors duration-200"
                >
                  Go Back...
                </span>
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Error;
