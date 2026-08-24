import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { FcGoogle } from "react-icons/fc";
import { useRef } from "react";

function GoogleButton() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Google login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Google Login Error:", error);

      toast.error(
        error.response?.data?.message || "Google login failed."
      );
    }
  };

  const handleGoogleClick = () => {
    const googleButton =
      googleButtonRef.current?.querySelector('[role="button"]');

    if (googleButton) {
      googleButton.click();
    }
  };

  return (
    <>
      {/* Hidden Google Login */}
      <div
        ref={googleButtonRef}
        className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast.error("Google login failed.");
          }}
          useOneTap={false}
        />
      </div>

     {/* Custom Google Button */}
<button
  type="button"
  onClick={handleGoogleClick}
  className="
    w-full
    h-[52px]
    rounded-2xl
    bg-white/5
    border border-white/10
    backdrop-blur-sm
    flex items-center justify-center
    gap-3
    text-gray-200
    text-sm
    font-medium
    transition-all
    duration-200
    hover:bg-white/10
    hover:border-white/20
    active:scale-[0.98]
  "
>
  <span
    className="
      w-6
      h-6
      rounded-full
      bg-white
      flex items-center
      justify-center
      shrink-0
    "
  >
    <FcGoogle size={16} />
  </span>

  <span>Continue with Google</span>
</button>
    </>
  );
}

export default GoogleButton;