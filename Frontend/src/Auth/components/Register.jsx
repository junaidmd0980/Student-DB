import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setIsLoading(true);

      await register(username, email, password);

      sessionStorage.setItem("verificationEmail", email);

      navigate("/verify-email", {
        replace: true,
        state: {
          email,
        },
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__icon" aria-hidden="true">
            <GraduationCap size={22} />
          </div>

          <div className="auth-brand__name">
            <span>Student</span>
            <strong>DB</strong>
          </div>
        </div>

        <div className="auth-heading">
          <h1>Create your account</h1>

          <p>
            Join <span className="brand-text">Student DB</span> today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="register-username">Username</label>

          <input
            id="register-username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
          />

          <label htmlFor="register-email">Email</label>

          <input
            id="register-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;