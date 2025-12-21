"use client";

// Import Next.js navigation hooks
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

/**
 * Routes that are accessible without authentication
 * Users can access these pages even when not logged in
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
];

/**
 * TemplatePage Component
 * 
 * This component wraps all pages and provides route protection.
 * It checks if the user is authenticated and redirects them appropriately:
 * - Unauthenticated users trying to access protected routes → redirect to home
 * - Authenticated users trying to access login/signup → allowed (they can still view these)
 * 
 * Uses Next.js template.tsx which re-renders on navigation (unlike layout.tsx).
 * This ensures route protection checks happen on every route change.
 * 
 * @param children - The page content to render if access is allowed
 */
const TemplatePage = memo(({ children }: { children: React.ReactNode }) => {
  // Get authentication state from context
  const { loading, isAuthenticated } = useAuth();
  
  // Get current route path
  const pathname = usePathname();
  
  // Router for programmatic navigation
  const router = useRouter();

  // Check if current route is public (accessible without auth)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Determine if access to current route is allowed
  // Allowed if:
  // 1. Route is public (anyone can access), OR
  // 2. User is authenticated (authenticated users can access protected routes)
  const routeAllowed = isPublicRoute || isAuthenticated;

  /**
   * Redirect effect
   * Redirects unauthenticated users away from protected routes
   */
  useEffect(() => {
    // Only redirect after auth state has been checked (loading is false)
    // and if the route is not allowed
    if (!loading && !routeAllowed) {
      // Redirect to home page if trying to access protected route without auth
      router.replace("/");
    }
  }, [loading, routeAllowed, router]);

  // Show loading state while checking authentication
  // Prevents flash of content before auth state is determined
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Render page content if route is allowed
  if (routeAllowed) {
    return <>{children}</>;
  }

  // Show loading state while redirecting
  // This prevents flash of protected content before redirect happens
  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
    </div>
  );
});

TemplatePage.displayName = "TemplatePage";

export default TemplatePage;

