import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';                  
import Footer from '../components/Footer'; 

const MainLayout = () => {
  return (
    <>
      <Header /> 
      <main>
        {/* Outlet là nơi nội dung của Home, Login, Register... sẽ hiển thị */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;