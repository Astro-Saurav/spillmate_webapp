import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/react-app/hooks/useAuth";
import Layout from "@/react-app/components/Layout";
import DocumentLayout from "@/react-app/components/DocumentLayout";

// Import All Your Page Components
import Welcome from "@/react-app/pages/Welcome";
import Login from "@/react-app/pages/Login";
import Dashboard from "@/react-app/pages/Dashboard";
import Conversations from "@/react-app/pages/Conversations";
import MoodTracker from "@/react-app/pages/MoodTracker";
import Insights from "@/react-app/pages/Insights";
import Pricing from "@/react-app/pages/Pricing";
import Admin from "@/react-app/pages/Admin";
import Settings from "./pages/Settings";
import FAQ from "@/react-app/pages/FAQ";
import Terms from "@/react-app/pages/Terms";


// --- THIS IS THE UPDATED ProtectedRoute COMPONENT ---
// It now acts as a "layout route" using the <Outlet /> component.
function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  // While checking auth, show a global loader
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the main application layout.
  // The <Outlet /> is where the nested child routes (Dashboard, etc.) will be rendered.
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// --- THIS IS THE UPDATED AppRoutes COMPONENT ---
// The protected routes are now cleaner and grouped together.
function AppRoutes() {
  const { user, loading } = useAuth();
  
  // To prevent a flicker on page load, we can wait for auth state to resolve
  // before rendering routes that depend on the user object.
  if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-950">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500"></div>
        </div>
      );
  }

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      {/* If the user is logged in, these routes will redirect to the dashboard. */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Welcome />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/pricing" element={<DocumentLayout><Pricing /></DocumentLayout>} />

      {/* --- PROTECTED ROUTES --- */}
      {/* This single parent route handles authentication for all nested routes. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/mood-tracker" element={<MoodTracker />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} /> {/* Moved to be protected */}
        {/* Only show the admin route if the user has the admin role */}
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Route>

      {/* --- PUBLIC DOCUMENT ROUTES --- */}
      <Route path="/faq" element={<DocumentLayout><FAQ /></DocumentLayout>} />
      <Route path="/terms" element={<DocumentLayout><Terms /></DocumentLayout>} />
      <Route path="/privacy" element={<DocumentLayout><Terms /></DocumentLayout>} /> {/* Assuming Privacy uses Terms layout */}

      {/* --- FALLBACK ROUTE --- */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

// The main App component (no changes needed here)
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
