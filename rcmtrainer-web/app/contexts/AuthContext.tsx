"use client";

// Import Firebase types and auth state listener
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";

/**
 * Type definition for the authentication context
 * This defines what data is available to components using the useAuth hook
 */
interface AuthContextType {
  user: User | null;              // Firebase user object (contains email, uid, etc.)
  loading: boolean;                // True while Firebase is checking auth state
  isAuthenticated: boolean;        // Convenience boolean (true if user exists)
}

/**
 * Default values for the AuthContext
 * Used as initial state before Firebase checks auth state
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state to all child components.
 * Uses Firebase's onAuthStateChanged listener to automatically update when users
 * log in, log out, or when their token refreshes.
 * 
 * @param children - React components that will have access to auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to hold the current Firebase user (null if not logged in)
  const [user, setUser] = useState<User | null>(null);
  
  // State to track if Firebase has finished checking auth state
  // Starts as true, becomes false after initial check
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Auth state change listener
   * This runs whenever authentication state changes:
   * - User logs in
   * - User logs out
   * - Token refreshes
   * - Session expires
   * - Initial auth state check (on page load)
   */
  useEffect(() => {
    // Subscribe to auth state changes
    // onAuthStateChanged fires immediately with current user (or null)
    // and then fires again whenever auth state changes
    // Returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Update the user state in context
      // currentUser will be null if logged out, or User object if logged in
      setUser(currentUser);
      // Set loading to false after initial auth state is determined
      // This happens on the first call (page load)
      setLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts
    // This prevents memory leaks
    return () => unsubscribe();
  }, []);

  // Provide auth state to all child components via Context
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user  // Convert user to boolean (true if user exists)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication state in any component.
 * 
 * @returns {AuthContextType} Object containing user, loading, and isAuthenticated
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, isAuthenticated } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please log in</div>;
 *   
 *   return <div>Welcome, {user?.email}</div>;
 * }
 * ```
 */
export const useAuth = () => useContext(AuthContext);

