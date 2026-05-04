import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
    try {
        const res = await api.get('/vehicles');
        // Kiểm tra xem dữ liệu nằm ở res.data.data hay trực tiếp ở res.data
        const vehicleData = res.data.data || res.data; 
        
        if (Array.isArray(vehicleData)) {
            setVehicles(vehicleData);
        } else {
            console.error("Dữ liệu trả về không phải mảng:", vehicleData);
            setVehicles([]);
        }
    } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        setVehicles([]);
    } finally {
        setLoading(false);
    }
};
        fetchVehicles();
    }, []);

    return (
        <VehicleContext.Provider value={{ vehicles, loading }}>
            {children}
        </VehicleContext.Provider>
    );
};

export const useVehicles = () => useContext(VehicleContext);