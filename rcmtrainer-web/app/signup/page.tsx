"use client";

// Import React hooks for state management and navigation
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import Firebase authentication function and auth instance
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

/**
 * Type definition for the signup form data
 */
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validates password strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one special character
 * 
 * @param password - The password to validate
 * @returns Object with isValid boolean and error message string
 */
const validatePassword = (password: string): { isValid: boolean; error: string } => {
  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long"
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one capital letter"
    };
  }

  // Check for at least one special character
  // Special characters include: !@#$%^&*()_+-=[]{}|;:'",.<>?/~`
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character"
    };
  }

  return { isValid: true, error: "" };
};

/**
 * SignupPage Component
 * 
 * This component provides a signup form with email, password, and confirm password fields.
 * It validates password strength (8+ chars, uppercase, special char) before submission.
 * On successful account creation, it redirects to the home page.
 * On failure, it displays appropriate error messages in red text.
 */
export default function SignupPage() {
  // Router hook for programmatic navigation
  const router = useRouter();
  
  // Get auth state from context
  const { loading: authLoading, isAuthenticated } = useAuth();

  // State for form input values
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // State for error message (displayed in red when signup fails)
  const [error, setError] = useState<string>("");

  // State to track if form submission is in progress (prevents double submissions)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State to toggle password visibility for both password fields
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  /**
   * Redirect effect - if user is already authenticated, redirect to home
   * Prevents authenticated users from seeing the signup form
   */
  useEffect(() => {
    // Only redirect after auth state has been determined
    if (!authLoading && isAuthenticated) {
      router.push("/home");
    }
  }, [authLoading, isAuthenticated, router]);

  /**
   * Handles form submission
   * 
   * Validates password strength and password match, then attempts to create
   * a new user account with Firebase Auth using the provided email and password.
   * On success, redirects to the home page. On failure, displays an error message.
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

    // Validate that all fields are filled
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error);
      return;
    }

    // Set loading state to prevent multiple submissions
    setIsLoading(true);

    try {
      // Attempt to create a new user account with Firebase Auth
      // createUserWithEmailAndPassword returns a UserCredential object on success
      // This function also automatically signs the user in after account creation
      await createUserWithEmailAndPassword(auth, email, password);

      // If successful, redirect to the home page
      // Using router.push for client-side navigation (faster than full page reload)
      router.push("/home");
    } catch (error: unknown) {
      // Account creation failed - display appropriate error message
      // Firebase provides specific error codes we can check
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        
        // Handle specific Firebase error codes
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            setError("This email is already registered. Please sign in instead.");
            break;
          case 'auth/invalid-email':
            setError("Invalid email address. Please check your email format.");
            break;
          case 'auth/operation-not-allowed':
            setError("Email/password authentication is not enabled. Please contact support.");
            break;
          case 'auth/weak-password':
            setError("Password is too weak. Please ensure it meets all requirements.");
            break;
          default:
            setError("Failed to create account. Please try again.");
        }
      } else {
        // Generic error fallback
        setError("Failed to create account. Please try again.");
      }
      
      // Optional: Log error for debugging (remove in production if not needed)
      console.error("Signup error:", error);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  // Show loading state while checking if user is already authenticated
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Don't render signup form if user is already authenticated
  // (redirect will happen via useEffect)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center py-32 px-8 bg-white dark:bg-black">
        {/* Signup Form Container */}
        <div className="w-full max-w-md space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sign up to get started
            </p>
          </div>

          {/* Signup Form */}
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
                  autoComplete="new-password"
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
              {/* Password Requirements Hint */}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Must be at least 8 characters with one capital letter and one special character
              </p>
            </div>

            {/* Confirm Password Input Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Confirm Password
              </label>
              {/* Confirm password input with eye icon toggle */}
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-base text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {/* Eye icon button to toggle confirm password visibility */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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

            {/* Error Message Display (shown in red when signup fails) */}
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
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Link to Login Page */}
          <div className="text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

