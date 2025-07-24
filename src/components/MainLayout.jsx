// 📄 src/components/MainLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Analytics />
    </>
  );
}

export default MainLayout;
