import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { login, validateLoginInput } from "../../lib/adminApi";
import loginimage from "../../assets/login.jpg";

interface LoginScreenProps {
  onSignIn?: (email: string, password: string) => void;
}

export default function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate input locally first
    const validationError = validateLoginInput(identifier, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(identifier, password);

      if (response.success) {
        setSuccess(true);

        // Store token if available
        if (response.data?.token) {
          localStorage.setItem("authToken", response.data.token);
        }

        // Call parent callback if provided
        onSignIn?.(identifier, password);

        // Navigate to dashboard after brief delay to show success message
        setTimeout(() => {
          try {
            navigate("/admin/dashboard");
          } catch (e) {
            // ignore in non-router contexts
          }
        }, 500);
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Hero panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-cover bg-center p-10 lg:flex"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(120,50,10,0.35) 0%, rgba(90,35,10,0.75) 100%), url('${loginimage}')`,
        }}
      >
        <span className="text-2xl font-extrabold tracking-tight text-orange-400">
          DEYRA
        </span>

        <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
          Manage Your Platform With{" "}
          <span className="text-orange-400">Confidence</span>
        </h1>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="text-xl font-bold text-neutral-900">Welcome Back!</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your details below to sign in.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-green-50 p-3 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-green-800">
                Login successful! Redirecting...
              </p>
            </div>
          )}

          <label className="mt-6 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="text"
            required
            autoComplete="username"
            disabled={isLoading}
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setError(null);
            }}
            placeholder="example@email.com or +2347012345678"
            className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-50 disabled:text-neutral-500"
          />

          <label className="mt-4 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="enter password"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 pr-10 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                disabled={isLoading}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-400 disabled:opacity-50"
              />
              Remember Me
            </label>
            <a
              href="#"
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
