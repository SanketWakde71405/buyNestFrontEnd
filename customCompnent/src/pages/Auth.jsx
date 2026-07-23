import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Contexts
import useTheme from "../contexts/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Icons
import { LuUserRoundPlus } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa6";
import { LuLock, LuRefreshCw } from "react-icons/lu";
import { IoSparklesSharp } from "react-icons/io5";
import { CiLock } from "react-icons/ci";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoMdArrowBack } from "react-icons/io";

// Components
import AuthLeftColumn from "../components/AuthComponents/AuthLeftColumn";
import FeatureItem from "../components/FeatureItem";
import SignInForm from "../components/AuthComponents/SignInForm";
import RegisterForm from "../components/AuthComponents/RegisterForm";
import RegistrationSucessModal from "../components/AuthComponents/RegistrationSuccess";
import AccessDeniedModal from "../components/AuthComponents/AccessDenied";
import ForgotPasswordModal from "../components/AuthComponents/ForgotPasswordModal";
import InputBox from "../components/InputBox";
import ResetPasswordForm from "../components/AuthComponents/ResetPasswordForm";
import PasswordResetSuccessModal from "../components/AuthComponents/PasswordResetSuccessModal";

function Auth() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Register success Modal states and onRegisterSuccess function
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const handleRegisterSuccess = (user) => {
    setRegisteredUser(user);
    setShowSuccessDialog(true);
  };

  // Access Denied Modal states and onAccessDenied function
  const [showAccessDeniedDialog, setShowAccessDeniedDialog] = useState(false);
  const [deniedUser, setDeniedUser] = useState(null);
  const handleAccessDenied = (user) => {
    setDeniedUser(user);
    setShowAccessDeniedDialog(true);
  };

  // Handling forgot password state
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] =
    useState(false);
  const [mail, setMail] = useState(null);
  const showLinkSentMessage = (email) => {
    setMail(email);
    setShowForgotPasswordDialog(true);
  };

  // Password Reset Success Modal and handling reset success function
  const [showResetSuccessDialog, setShowResetSuccessDialog] = useState(false);
  const handleResetSuccess = () => {
    setShowResetSuccessDialog(true);
  };

  const activeTab = location.pathname.includes("register")
    ? "register"
    : location.pathname.includes("reset-password")
      ? "reset-password"
      : "signin";

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex flex-row w-full h-screen bg-gradient-to-br from-slate-50  via-violet-50 to-indigo-50 dark:bg-none dark:bg-slate-950">
        {/* ───── Left column ───── */}
        {activeTab === "signin" || activeTab === "register" ? (
          <AuthLeftColumn
            headingText="Manage Your"
            headingTextGradient="Store"
            subHeadingText="Grow Your"
            subHeadingTextGradient=" Business"
            subTitle="Powerful tools to manage products, orders, customers, and boost your ecommerce success"
            image="https://res.cloudinary.com/dx88pbasu/image/upload/v1782722280/heroImage_eyxww2.png"
            imageDark="https://res.cloudinary.com/dx88pbasu/image/upload/v1782722779/heroImage_dark_srrrn4.png"
            isLock={false}
          />
        ) : (
          <AuthLeftColumn
            headingText="Reset your"
            headingTextGradient="Password"
            subHeadingText="Secure Your"
            subHeadingTextGradient="Account"
            subTitle="Choose a strong password to keep your account secure and continue managing your store with ease."
            image="https://res.cloudinary.com/dx88pbasu/image/upload/v1784720956/resetPasswordImage_bchyuu.png"
            imageDark="https://res.cloudinary.com/dx88pbasu/image/upload/v1784741151/resetPasswordImageDark_aawudc.png"
            isLock={true}
          />
        )}

        {/* ───── Right column — Forms ───── */}
        <div className="flex flex-col w-[50%] shrink-0 h-screen justify-center items-center py-4">
          {activeTab === "signin" || activeTab === "register" ? (
            <div className="flex flex-col w-[80%] max-h-[90vh] overflow-y-auto scrollbar-thin py-4 px-5 mx-10 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-lg shadow-xl z-20">
              <div className="flex flex-row justify-center items-center bg-violet-50 dark:bg-slate-900 border border-violet-100 dark:border dark:border-slate-800 rounded-lg p-2 mx-2 my-1">
                <div
                  className={`flex flex-1 gap-2 justify-center rounded-lg py-2 items-center cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600"
                      : "bg-transparent"
                  }`}
                  onClick={() => {
                    navigate("/auth/signin");
                  }}
                >
                  <FaRegUser
                    className={
                      activeTab === "signin"
                        ? "text-white"
                        : "text-zinc-800 dark:text-gray-200"
                    }
                    size={25}
                  />
                  <span
                    className={
                      activeTab === "signin"
                        ? "text-white"
                        : "text-zinc-800 dark:text-gray-200"
                    }
                  >
                    Sign In
                  </span>
                </div>

                <div
                  onClick={() => {
                    navigate("/auth/register");
                  }}
                  className={`flex flex-1 gap-2 justify-center rounded-lg py-2 items-center cursor-pointer ${
                    activeTab === "register"
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600"
                      : "bg-transparent"
                  }`}
                >
                  <LuUserRoundPlus
                    className={
                      activeTab === "register"
                        ? "text-white"
                        : "text-zinc-800  dark:text-gray-200"
                    }
                    size={25}
                  />
                  <span
                    className={
                      activeTab === "register"
                        ? "text-white"
                        : "text-zinc-800 dark:text-gray-200"
                    }
                  >
                    Register
                  </span>
                </div>
              </div>

              {activeTab === "signin" ? (
                // 🧪 Pass handleTestFirstLogin for testing; swap to handleSignInSuccess for production
                <SignInForm
                  onAccessDenied={handleAccessDenied}
                  sendForgotPassword={showLinkSentMessage}
                />
              ) : (
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              )}
            </div>
          ) : (
            <div className="flex flex-col w-[80%] justify-start items-center py-4 px-5 mx-10 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-lg shadow-xl z-20">
              <ResetPasswordForm onResetSuccess={handleResetSuccess} />
            </div>
          )}
        </div>

        {/* Modals */}
        {showSuccessDialog && (
          <RegistrationSucessModal
            onClose={() => setShowSuccessDialog(false)}
            onGoToSignIn={() => {
              setShowSuccessDialog(false);
              navigate("/auth/signin");
            }}
            registeredUser={registeredUser}
          />
        )}
        {showAccessDeniedDialog && (
          <AccessDeniedModal
            onClose={() => setShowAccessDeniedDialog(false)}
            deniedUser={deniedUser}
          />
        )}
        {showForgotPasswordDialog && (
          <ForgotPasswordModal
            onClose={() => setShowForgotPasswordDialog(false)}
            mail={mail}
          />
        )}

        {showResetSuccessDialog && (
          <PasswordResetSuccessModal
            onGoToSignIn={() => {
              setShowResetSuccessDialog(false);
              navigate("/auth/signin");
            }}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default Auth;
