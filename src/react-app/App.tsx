import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import FAQ from "@/react-app/pages/FAQ";
import Terms from "@/react-app/pages/Terms";
import Settings from "./pages/Settings";


// A reusable component to protect routes that require authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // While checking for user auth, show a global loader
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
  
  // If authenticated, render the children within the main application layout
  return <Layout>{children}</Layout>;
}

// Defines all the routes for the application
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Welcome />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* --- PROTECTED ROUTES (rendered within main Layout) --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
      <Route path="/mood-tracker" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

      {/* --- PUBLIC DOCUMENT ROUTES (rendered within DocumentLayout) --- */}
      <Route path="/faq" element={<DocumentLayout><FAQ /></DocumentLayout>} />
      <Route path="/terms" element={<DocumentLayout><Terms /></DocumentLayout>} />
      <Route path="/privacy" element={<DocumentLayout><Terms /></DocumentLayout>} />
      <Route path="/settings" element={<DocumentLayout><Settings /></DocumentLayout>} />

      {/* --- FALLBACK ROUTE --- */}
      {/* Any other path will redirect to the dashboard if logged in, or home if not */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

// The main App component that sets up the auth context and router
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}