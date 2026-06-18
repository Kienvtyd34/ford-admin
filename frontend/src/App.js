import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VehicleProvider } from './context/VehicleContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Components & Pages
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactListPage from './pages/ContactListPage';
import VehicleDetail from './pages/VehicleDetail';
import VehicleInventory from './pages/VehicleInventory';
import PriceList from './pages/PriceList'; 
import ContactFord from './pages/ContactFord';
import StaffManagement from './pages/StaffManagement';
import BookingHistory from './pages/BookingHistory';
import InstallmentGuide from './pages/InstallmentGuide';
import NewsUser from './pages/NewsUser';
import NewsAdmin from './pages/NewsAdmin';
import StaffCustomerInfo from './pages/StaffCustomerInfo';
import VerifyEmail from './pages/VerifyEmail';
import NewsDetail from './components/NewsDetail';
import InventoryDashboard from './pages/InventoryDashboard';
import AdminVehicle from './pages/AdminVehicleColor';
import TestDrivePage from './pages/TestDrivePage';
import TestDriveList from './pages/TestDriveList';
import Chatbot from './components/Chatbot';
import IntentAdmin from './pages/IntentAdmin';
function App() {
  return (
    <VehicleProvider>
      <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* NHÓM 1: Giao diện khách hàng (Có Header/Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bang-gia" element={<PriceList />} />
          <Route path="/lien-he" element={<ContactFord />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/mua-xe-tra-gop" element={<InstallmentGuide />} />
          <Route path="/tin-tuc" element={<NewsUser />} />
          <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/test-drive" element={<TestDrivePage />} />
            <Route path="/chatbot" element={<Chatbot />} />
          {/* ĐƯỜNG DẪN CHI TIẾT XE: Phải khớp với Link trong Header */}
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
        </Route>

        <Route 
  path="/admin" 
  element={
    <ProtectedRoute roles={['admin', 'staff']}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="contacts" element={<ContactListPage />} />
  <Route path="inventory" element={<VehicleInventory />} />
  <Route path="news" element={<NewsAdmin />} />
  <Route path="dashboard" element={<InventoryDashboard />} />
  <Route path="vehicle" element={<AdminVehicle/>}/>
  <Route path="test-drive-list" element={<TestDriveList />} />
  {/* CHỈ ADMIN MỚI VÀO ĐƯỢC TRANG NÀY */}
  <Route 
    path="hr-management" 
    element={
      <ProtectedRoute roles={['admin']}>
        <StaffManagement />
      </ProtectedRoute>
    } 
 />

  <Route path="customer-info" element={<StaffCustomerInfo />} />
  <Route path="intents" element={<IntentAdmin />} />
  <Route index element={<Navigate to="/admin/contacts" />} />
</Route>

        {/* Điều hướng mặc định nếu sai link */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </VehicleProvider>
    
  );
}

export default App;