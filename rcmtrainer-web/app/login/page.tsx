"use client";

// Import React hooks for state management and navigation
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import Firebase authentication function and auth instance
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

/**
 * Type definition for the login form data
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * LoginPage Component
 * 
 * This component provides a login form with email and password fields.
 * On successful authentication, it redirects to the home page.
 * On failure, it displays an error message in red text.
 */
export default function LoginPage() {
  // Router hook for programmatic navigation
  const router = useRouter();

  // State for form input values
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // State for error message (displayed in red when authentication fails)
  const [error, setError] = useState<string>("");

  // State to track if form submission is in progress (prevents double submissions)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /**
   * Handles form submission
   * 
   * Attempts to sign in the user with Firebase Auth using the provided
   * email and password. On success, redirects to the home page.
   * On failure, displays an error message.
   * 
   * @param e - Form submission event
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Clear any previous error messages
    setError("");

    // Prevent multiple simultaneous submissions
    if (isLoading) return;

    // Validate that both fields are filled
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Set loading state to prevent multiple submissions
    setIsLoading(true);

    try {
      // Attempt to sign in with Firebase Auth
      // signInWithEmailAndPassword returns a UserCredential object on success
      await signInWithEmailAndPassword(auth, email, password);

      // If successful, redirect to the home page
      // Using router.push for client-side navigation (faster than full page reload)
      router.push("/home");
    } catch (error: unknown) {
      // Authentication failed - display error message
      // The error message will be displayed in red text below the form
      setError("Incorrect email or password");
      
      // Optional: Log error for debugging (remove in production if not needed)
      console.error("Login error:", error);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center py-32 px-8 bg-white dark:bg-black">
        {/* Login Form Container */}
        <div className="w-full max-w-md space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Login
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            {/* Email Input Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Input Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              {/* Password input with eye icon toggle */}
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-base text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {/* Eye icon button to toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye icon (visible)
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    // Eye slash icon (hidden)
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Display (shown in red when authentication fails) */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-zinc-900 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-zinc-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Link to Signup Page */}
          <div className="text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


// sign in
// domain redirection
// logout
