import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🔹 Shared Layouts & Guards
import MainLayout from './components/MainLayout';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RequireLoyeRole from './components/RequireLoyeRole'; // ✅ role-based Loye guard

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

// 🔹 Embedded Loye Pages (Unified flow)
import LoyeOnboarding from './pages/loye/LoyeOnboarding';
import LoyeDashboard from './pages/loye/LoyeDashboard';
import OwnerProperties from './pages/loye/OwnerProperties';
import CreateProperty from './pages/loye/CreateProperty'; // ✅ Add CreateProperty page
import PropertyDetailView from './pages/loye/PropertyDetailView';

import RenterDashboard from './pages/loye/RenterDashboard';

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
        {/* 🏠 Main App Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/request-host" element={<HostRequestForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/loye/dashboard" element={<RenterDashboard />} />


          {/* 🔓 Public Property Detail Pages */}
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/listing/:id" element={<PropertyDetail />} />

          {/* 🔐 Protected User Routes */}
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/add" element={<RequireAuth><AddListing /></RequireAuth>} />
          <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/edit/:id" element={<RequireAuth><EditListing /></RequireAuth>} />
          <Route path="/host/dashboard" element={<RequireAuth><HostDashboard /></RequireAuth>} />

          {/* 🟦 Loye Flow */}
          <Route path="/loye/onboarding" element={<RequireAuth><LoyeOnboarding /></RequireAuth>} />
          <Route
            path="/loye/dashboard"
            element={
              <RequireAuth>
                <RequireLoyeRole role="renter">
                  <LoyeDashboard />
                </RequireLoyeRole>
              </RequireAuth>
            }
          />
          <Route
            path="/loye/properties"
            element={
              <RequireAuth>
                
                  <OwnerProperties />
                
              </RequireAuth>
            }
          />
          <Route
            path="/loye/create"
            element={
              <RequireAuth>
                <RequireLoyeRole role={["owner", "manager"]}>
                  <CreateProperty />
                </RequireLoyeRole>
              </RequireAuth>
            }
          />
          <Route path="/loye" element={<RequireAuth><LoyeOnboarding /></RequireAuth>} />
          <Route path="/loye/property/:id" element={<PropertyDetailView />} />

          {/* 🛠 Admin Routes */}
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
