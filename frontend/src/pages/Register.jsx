
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useState } from "react";

import { registerUser } from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import LoginButton from "../components/LoginButton";
import Divider from "../components/Divider";
import GoogleButton from "../components/GoogleButton";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration Successful");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-center text-red-400">
              {error}
            </div>
          )}

          <InputField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            icon={<User size={20} />}
          />

          <InputField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            icon={<Mail size={20} />}
          />

          <InputField
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            icon={<Lock size={20} />}
          />

          <InputField
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            icon={<Lock size={20} />}
          />

          <div className="mt-6">
            <LoginButton type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </LoginButton>
          </div>

          <Divider />

          <GoogleButton />

          <Link
            to="/"
            className="mt-7 flex justify-center text-sm font-medium text-blue-400 transition hover:text-white"
          >
            Already have an account? Login →
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;

