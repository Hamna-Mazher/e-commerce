import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import LoginButton from "../components/LoginButton";
import Divider from "../components/Divider";
import GoogleButton from "../components/GoogleButton";

function Login() {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  email: "",
  password: "",
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {

    const res = await loginUser(formData);

    // Save JWT Token
    localStorage.setItem("token", res.data.token);

    // Save Logged In User
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    navigate("/dashboard");

  } catch (err) {

    setError(
      err.response?.data?.message ||
      "Login Failed"
    );

  } finally {

    setLoading(false);

  }
};
  return (
    <AuthLayout>
      <AuthCard>
        <form onSubmit={handleSubmit}>

    <InputField
  name="email"
  type="email"
  placeholder="Email"
  value={formData.email}
  onChange={handleChange}
  icon={<Mail size={20} />}
/>
<InputField
  name="password"
  type="password"
  placeholder="Password"
  value={formData.password}
  onChange={handleChange}
  icon={<Lock size={20} />}
/>
          <div className="mb-6 flex items-center justify-between text-sm">
  <label className="flex items-center gap-2 text-gray-300">
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-gray-400 accent-blue-600"
    />
    Remember me
  </label>

  <div className="mt-2 text-right">
  <Link
    to="/forgot-password"
    className="text-sm text-blue-400 hover:text-blue-300"
  >
    Forgot Password?
  </Link>
</div>
</div>
          
{
error && (

<p className="mb-4 text-center text-red-400">
{error}
</p>

)
}
        <LoginButton>

{loading ? "Signing In..." : "Login"}

</LoginButton>
<Divider />

<div className="mt-5 flex justify-center">
  <GoogleButton />
</div>

<Link
  to="/register"
  className="
    mt-7
    flex
    justify-center
    text-sm
    font-medium
    text-blue-400
    transition
    duration-300
    hover:text-white
  "
>
  Create account →
</Link>

        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default Login;