import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { FaHome } from "react-icons/fa";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from ".././../lib/firebase";
import "./Phone.css";
import { Button, TextField, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import NavBar from "../NavBar";

const Phone = () => {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [otpSend, setOtpSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [hideRecaptcha, setHideRecaptcha] = useState(true);
  const navigate = useNavigate();

    // ✅ Initialize reCAPTCHA once
    useEffect(() => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
          size: "invisible", // Or 'normal' if you want it visible
          callback: (response) => {
            console.log("reCAPTCHA verified:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired, refresh required.");
          },
        });
    
        window.recaptchaVerifier.render().then((widgetId) => {
          window.recaptchaWidgetId = widgetId;
        });
      }
    }, []);
    


  const sendOtp = async () => {

    try {
      setSending(true);
      // ✅ Use the existing recaptchaVerifier instance
    const recaptcha = window.recaptchaVerifier;

    // ✅ Ensure reCAPTCHA is solved before proceeding
    await recaptcha.verify();
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha);
      setUser(confirmation);
      setOtpSend(true);
      setSending(false);
      setHideRecaptcha(false);
      setTimeout(() => {
        setOtpSend(false);
      }, 2000); // Store the confirmation object in the state
    } catch (err) {
      console.log(err);
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      const data = await user.confirm(otp);
      // console.log(data);
      localStorage.setItem("verifiedPhone", phone);
      setVerified(true);
      setVerifying(false);
      setTimeout(() => {
        setVerified(false);
      }, 2000);
      setTimeout(() => {
        navigate(`/register`);
      }, 3000);
    } catch (err) {
      setError(true);
      setVerifying(false);
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed md:top-4 md:left-4 text-[#02eda7] text-[35px] hover:text-[#62fff5] transition-all duration-[.3s] bottom-4 right-4 cursor-pointer">
        <FaHome
          onClick={() => {
            navigate(`/`);
          }}
        />
      </div>
      {/*<NavBar /> */}
      <div className="phoneSignin">
        {/* <Snackbar open="true" autoHideDuration={6000} message="Number Verified" /> */}

        <div className="phoneContent">
          {verified && (
            <Alert severity="success" className=" mb-20">
              Mobile Number Verified!
            </Alert>
          )}
          {otpSend && (
            <Alert severity="success" className=" mb-20">
              Otp Send!
            </Alert>
          )}
          {error && (
            <Alert severity="error" className=" mb-20">
              Some Error Ocured
            </Alert>
          )}
          <PhoneInput
            className="inputphone w-full sm:w-auto "
            country={"in"}
            value={phone}
            onChange={(phone) => setPhone("+" + phone)}
          />
          {/* <div>
          <Button onClick={capctha} variant="contained" sx={{ mt: [3, 4] }}>
            capctha
          </Button></div> */}
          {/* <p className="mt-2 text-white">Please verify Only Once</p> */}
           {/* ✅ reCAPTCHA is now visible and clickable */}
           <div id="recaptcha" className="mt-4"></div>
          <Button
            onClick={sendOtp}
            disabled={sending}
            sx={{
              mt: [3, 4],
              backgroundColor: sending ? "#103861" : undefined,
              color: "#fff",
            }}
            className="phoneAuthButton"
          >
            <span>{sending ? "Sending.." : "Send otp"}</span>
          </Button>
          
          {hideRecaptcha && (
            <div id="recaptcha" style={{ marginTop: "10px" }}></div>
          )}
          <br />
          <span className="text-white"> Enter Your Otp </span>
          <br />
          <TextField
            // variant="outlined"
            size="small"
            label="Enter Your Otp"
            InputLabelProps={{
              style: { color: "#b53eff", fontFamily: "cursive" },
            }}
            inputProps={{ style: { color: "black" } }}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-3 w-full sm:w-auto text-white bg-white  outline border-sm rounded"
            sx={{ mt: [3, 4], width: ["100%", "300px"] }}
          />
          <br />
          <Button
            onClick={verifyOtp}
            disabled={verifying}
            sx={{
              mt: [3, 4],
              backgroundColor: verifying ? "#2f5c32" : undefined,
              color: "#fff",
            }}
            className="phoneAuthButton"
          >
            <span>{verifying ? "verifying..." : "Verify Otp"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Phone;
