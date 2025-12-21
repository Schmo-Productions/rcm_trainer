"use client";

// Import React hooks and Firebase Auth
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

/**
 * HomePage Component
 * 
 * Protected page that displays welcome message and user information.
 * Includes a logout button that signs the user out and redirects to home page.
 */
export default function HomePage() {
  // Router for navigation after logout
  const router = useRouter();
  
  // Get current user from auth context
  const { user } = useAuth();
  
  // State to track if logout is in progress (prevents double clicks)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  /**
   * Handles logout action
   * Signs the user out of Firebase Auth and redirects to home page
   */
  const handleLogout = async () => {
    // Prevent multiple simultaneous logout attempts
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Sign out from Firebase Auth
      // This clears the auth token from Local Storage
      // and triggers onAuthStateChanged in AuthContext (which sets user to null)
      await signOut(auth);
      
      // Redirect to home page after successful logout
      // The template.tsx will handle showing login page since user is now null
      router.push("/");
    } catch (error) {
      // Handle logout errors (should be rare)
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to Home
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            You have successfully logged in!
          </p>
          {/* Display user email if available */}
          {user?.email && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Signed in as: {user.email}
            </p>
          )}
        </div>

        {/* Logout Button */}
        <div className="w-full flex justify-center sm:justify-start">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-12 w-full items-center justify-center rounded-md bg-zinc-900 px-5 text-base font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus:ring-zinc-400 sm:w-auto sm:px-8"
          >
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </main>
    </div>
  );
}

