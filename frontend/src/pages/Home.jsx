import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

import VehicleCard from '../components/VehicleCard';
import ContactForm from '../components/ContactForm';
import ImageGalleryHome from '../components/ImageGalleryHome';
import Chatbot from '../components/Chatbot';

import { useVehicles } from '../context/VehicleContext';

function Home() {
  const { vehicles, loading } = useVehicles();

  const [activeTab, setActiveTab] = useState("Tất cả");

  // ================= CHATBOT =================
  const [openChat, setOpenChat] = useState(false);

  // ================= FILTER TYPES =================
  const types = useMemo(() => {
    if (!vehicles) return ["Tất cả"];

    const uniqueTypes = [
      "Tất cả",
      ...new Set(
        vehicles.map((car) => car.type?.trim())
      ),
    ];

    return uniqueTypes;
  }, [vehicles]);

  // ================= FILTER VEHICLES =================
  const displayVehicles = useMemo(() => {
    if (!vehicles) return [];

    if (activeTab === "Tất cả") return vehicles;

    return vehicles.filter(
      (car) =>
        car.type?.trim() === activeTab.trim()
    );
  }, [vehicles, activeTab]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mb-4"></div>

        <p className="text-blue-900 font-bold animate-pulse">
          Đang kết nối dữ liệu Ford...
        </p>
      </div>
    );
  }

  // ================= ANIMATION =================
  const containerVariants = {
    hidden: { opacity: 0 },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="font-sans relative">
      
      {/* ================= HERO ================= */}
      <section className="relative h-[750px] flex items-start justify-center overflow-hidden">
        <img
          src="/photo-1609362092918-47a34787c260.jpg"
          alt="Ford Ranger"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white pt-28 px-4 max-w-5xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mb-6 leading-tight uppercase tracking-tight">
            Bản lĩnh không nằm ở lời nói,
            <br className="hidden md:block" />
            bản lĩnh nằm ở những nơi ta đã đi qua.
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-white opacity-50"></div>

            <p className="text-xl md:text-2xl font-medium tracking-widest uppercase italic opacity-90">
              Ford Quế Võ
            </p>

            <div className="h-[1px] w-12 bg-white opacity-50"></div>
          </div>
        </motion.div>
      </section>

      {/* ================= FILTER ================= */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-wrap justify-center gap-2 border border-gray-100 max-w-4xl mx-auto">
          
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-8 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === type
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-white text-gray-400 hover:bg-gray-50 hover:text-blue-900"
              }`}
            >
              {type}
            </button>
          ))}

        </div>
      </div>

      {/* ================= VEHICLE LIST ================= */}
      <main className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-16 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-black text-blue-900 uppercase tracking-widest mb-4">
              Dòng xe {activeTab !== "Tất cả" ? activeTab : ""} tiêu biểu
            </h3>

            <div className="h-1.5 w-24 bg-red-600"></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            key={activeTab}
          >
            {displayVehicles.length > 0 ? (
              displayVehicles.map((car) => (
                <motion.div
                  key={car._id}
                  variants={itemVariants}
                >
                  <VehicleCard vehicle={car} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400 font-bold italic uppercase tracking-widest">
                  Hiện chưa có dòng xe {activeTab} trong kho.
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </main>

      {/* ================= GALLERY ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <ImageGalleryHome />
      </motion.div>

      {/* ================= CONTACT ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <ContactForm />
      </motion.div>

      {/* ================================================= */}
      {/* ================= CHATBOT FLOAT ================= */}
      {/* ================================================= */}

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {openChat && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-5 z-[9999]"
          >
            <div className="relative shadow-2xl rounded-2xl overflow-hidden">
              
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setOpenChat(false)}
                className="absolute top-3 right-3 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition"
              >
                <X size={18} />
              </button>

              <Chatbot />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        onClick={() => setOpenChat(!openChat)}
        className="fixed bottom-6 right-5 z-[9999] w-16 h-16 rounded-full bg-blue-700 hover:bg-blue-800 shadow-2xl flex items-center justify-center text-white"
      >
        {openChat ? (
          <X size={30} />
        ) : (
          <MessageCircle size={30} />
        )}
      </motion.button>

    </div>
  );
}

export default Home;