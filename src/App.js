// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🔹 Shared Layouts & Guards
import MainLayout from './components/MainLayout';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RequireLoyeRole from './components/RequireLoyeRole';

// 🔹 User & Host Pages
import Home from './pages/Home';
import Monthly from './pages/Monthly';
import Daily from './pages/Daily';
import PropertyDetail from './pages/loye/PropertyDetailView';

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

// 🔹 Loye (use the polished dashboard, NOT the backup)
import LoyeOnboarding from './pages/loye/LoyeOnboarding';
import LoyeDashboard from './pages/loye/LoyeDashboard'; // ✅ polished version
// ❌ DO NOT import './pages/loye/LoyeDashboard.backup.jsx'
import OwnerProperties from './pages/loye/OwnerProperties';
import CreateProperty from './pages/loye/CreateProperty';
import PropertyDetailView from './pages/loye/PropertyDetailView';
import ReceiptPage from './pages/loye/ReceiptPage'; // ✅ NEW: receipt page

// 🔹 Admin
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
        {/* 🌐 Public Pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/request-host" element={<HostRequestForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/listing/:id" element={<PropertyDetail />} />

          {/* 🔒 Authenticated Users */}
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/add" element={<RequireAuth><AddListing /></RequireAuth>} />
          <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/edit/:id" element={<RequireAuth><EditListing /></RequireAuth>} />
          <Route path="/host/dashboard" element={<RequireAuth><HostDashboard /></RequireAuth>} />

          {/* 🏢 Loye Flow */}
          <Route path="/loye/onboarding" element={<RequireAuth><LoyeOnboarding /></RequireAuth>} />
          <Route path="/loye" element={<RequireAuth><LoyeOnboarding /></RequireAuth>} />
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
          <Route path="/loye/properties" element={<RequireAuth><OwnerProperties /></RequireAuth>} />
          <Route path="/loye/create" element={<RequireAuth><CreateProperty /></RequireAuth>} />
          <Route path="/loye/property/:id" element={<RequireAuth><PropertyDetailView /></RequireAuth>} />

          {/* 🧾 NEW: Receipt routes */}
          <Route path="/loye/receipt/:id" element={<RequireAuth><ReceiptPage /></RequireAuth>} />
          <Route path="/loye/receipt/success" element={<RequireAuth><ReceiptPage /></RequireAuth>} />

          {/* 🛠 Admin */}
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

        {/* ❌ 404 */}
        <Route
          path="*"
          element={<h2 style={{ padding: '2rem', textAlign: 'center' }}>Page non trouvée</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;
