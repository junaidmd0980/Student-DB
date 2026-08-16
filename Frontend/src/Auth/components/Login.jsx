import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

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

    try {
      setIsLoading(true);

      await login(formData.email, formData.password);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed"
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
          <h1>Welcome back</h1>

          <p>
            Sign in to your{" "}
            <span className="brand-text">Student DB</span> account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Do not have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;