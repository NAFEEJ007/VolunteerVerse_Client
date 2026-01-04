import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Articles from './pages/Articles';
import QA from './pages/QA';
import Gallery from './pages/Gallery';
import MyEvents from './pages/MyEvents';
import Notices from './pages/Notices';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerArticles from './pages/OrganizerArticles';
import OrganizerQA from './pages/OrganizerQA';
import OrganizerGallery from './pages/OrganizerGallery';
import VolunteerStats from './pages/VolunteerStats';
import EventRequests from './pages/EventRequests';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import EventModeration from './pages/EventModeration';
import AdminNotices from './pages/AdminNotices';
import BannedPage from './pages/BannedPage';
import UserManagement from './pages/UserManagement';

// Component to redirect based on role
const RoleBasedRedirect = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!currentUser) {
    return <Home />;
  }

  // Redirect based on role
  if (userRole === 'volunteer') {
    return <Navigate to="/volunteer/dashboard" replace />;
  } else if (userRole === 'organizer') {
    return <Navigate to="/organizer/dashboard" replace />;
  } else if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/banned"
            element={
              <>
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <BannedPage />
                </main>
                <Footer />
              </>
            }
          />

          {/* Volunteer Routes */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/articles"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <Articles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/qa"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <QA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/gallery"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/my-events"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/notices"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <Notices />
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/articles"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerArticles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/qa"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerQA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/gallery"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/volunteer-stats"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <VolunteerStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/notices"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <Notices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/event-requests"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <EventRequests />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EventModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
