import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { verifyEmail } from "../services/auth.service";


const OTP_LENGTH = 6;


function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const email =
    location.state?.email ||
    sessionStorage.getItem(
      "verificationEmail"
    ) ||
    "";

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);


  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);


  function handleChange(index, event) {
    const value = event.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    /*
     * This also handles browser OTP autofill
     * or entering multiple digits into one input.
     */
    if (value.length > 1) {
      const digits = value
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH)
        .split("");

      const nextOtp = Array(OTP_LENGTH).fill("");

      digits.forEach((digit, digitIndex) => {
        if (digitIndex < OTP_LENGTH) {
          nextOtp[digitIndex] = digit;
        }
      });

      setOtp(nextOtp);

      const nextIndex = Math.min(
        digits.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    setOtp((previousOtp) => {
      const nextOtp = [...previousOtp];

      nextOtp[index] = value;

      return nextOtp;
    });

    if (
      value &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  }


  function handleKeyDown(index, event) {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  }


  function handlePaste(event) {
    event.preventDefault();

    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedOtp) {
      return;
    }

    const nextOtp = Array(OTP_LENGTH).fill("");

    pastedOtp
      .split("")
      .forEach((digit, index) => {
        nextOtp[index] = digit;
      });

    setOtp(nextOtp);

    const nextIndex = Math.min(
      pastedOtp.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[nextIndex]?.focus();
  }


  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const enteredOtp = otp.join("");

    if (!email) {
      setError(
        "Verification email is missing. Please register again."
      );

      return;
    }

    if (
      enteredOtp.length !== OTP_LENGTH
    ) {
      setError(
        `Please enter the ${OTP_LENGTH}-digit OTP.`
      );

      return;
    }

    try {
      setIsLoading(true);

      /*
       * This request validates the OTP and creates
       * the user in the backend.
       */
      await verifyEmail(
        email,
        enteredOtp
      );

      sessionStorage.removeItem(
        "verificationEmail"
      );

      navigate("/dashboard", {
        replace: true,
        state: {
          message:
            "Registration completed successfully.",
        },
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid or expired OTP."
      );

      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }


  function handleBackToRegister() {
    sessionStorage.removeItem(
      "verificationEmail"
    );

    navigate("/register", {
      replace: true,
    });
  }


  return (
    <main className="auth-page">
      <div className="auth-card verify-card">
        <div
          className="verify-icon"
          aria-hidden="true"
        >
          ✉
        </div>

        <h2>Verify your email</h2>

        <p className="verify-description">
          Enter the code sent to:
        </p>

        <p className="verify-email">
          {email || "your email address"}
        </p>

        <form onSubmit={handleSubmit}>
          <div
            className="otp-inputs"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] =
                    element;
                }}
                className="otp-input"
                type="text"
                value={digit}
                maxLength={OTP_LENGTH}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                aria-label={`OTP digit ${
                  index + 1
                }`}
                onChange={(event) =>
                  handleChange(index, event)
                }
                onKeyDown={(event) =>
                  handleKeyDown(index, event)
                }
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              otp.join("").length !== OTP_LENGTH
            }
          >
            {isLoading
              ? "Creating account..."
              : "Verify and create account"}
          </button>
        </form>

        <button
          type="button"
          className="text-button"
          onClick={handleBackToRegister}
          disabled={isLoading}
        >
          Back to registration
        </button>
      </div>
    </main>
  );
}


export default VerifyEmail;