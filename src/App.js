import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🔹 Shared Layouts
import MainLayout from './components/MainLayout';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

// 🔹 User & Host Pages
import Home from './pages/Home';
import Monthly from './pages/Monthly';
import Daily from './pages/Daily';
import PropertyDetail from './pages/PropertyDetail';
import AddListing from './pages/AddListing';
import Login from './pages/Login';
import AuthPage from './pages/AuthPage';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import HostDashboard from './pages/host/HostDashboard';
import HostRequestForm from './pages/HostRequestForm';
import ResetPassword from './pages/ResetPassword';
// 🔹 Loye Pages
import LoyeHome from './pages/loye/LoyeHome';
import LoyeSignup from './pages/loye/LoyeSignup';
import LoyeLogin from './pages/loye/LoyeLogin';
import LoyeDashboard from './pages/loye/LoyeDashboard';
import LoyeLayout from './pages/loye/LoyeLayout';
import OwnerProperties from './pages/loye/OwnerProperties';


// 🔹 Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Listings from './pages/admin/Listings';
import PopularListings from './pages/admin/PopularListings';
import PendingListings from './pages/admin/PendingListings';
import ListingPreview from './pages/admin/ListingPreview';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Main App Routes (with Apt Meuble Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/request-host" element={<HostRequestForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* 🔐 Protected Listing Detail Pages */}
          <Route
            path="/property/:id"
            element={
              <RequireAuth>
                <PropertyDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <RequireAuth>
                <PropertyDetail />
              </RequireAuth>
            }
          />

          {/* 🔐 Protected User Routes */}
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/add" element={<RequireAuth><AddListing /></RequireAuth>} />
          <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/edit/:id" element={<RequireAuth><EditListing /></RequireAuth>} />
          <Route path="/host/dashboard" element={<RequireAuth><HostDashboard /></RequireAuth>} />

          {/* 🔐 Admin Routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="listings" element={<Listings />} />
            <Route path="popular" element={<PopularListings />} />
            <Route path="pending" element={<PendingListings />} />
            <Route path="preview/:id" element={<ListingPreview />} />
            <Route path="listing/:id" element={<ListingPreview />} />
          </Route>
        </Route>

        {/* 🟦 Loye Section (separate layout) */}
        <Route path="/loye">
          <Route index element={<LoyeHome />} />
          <Route path="signup" element={<LoyeSignup />} />
          <Route path="login" element={<LoyeLogin />} />
          <Route element={<LoyeLayout />}>
            <Route path="dashboard" element={<LoyeDashboard />} />
            <Route path="properties" element={<OwnerProperties />} />
          </Route>
        </Route>

        {/* ❌ 404 Fallback */}
        <Route
          path="*"
          element={
            <h2 style={{ padding: '2rem', textAlign: 'center' }}>
              Page non trouvée
            </h2>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
