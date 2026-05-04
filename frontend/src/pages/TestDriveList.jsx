import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

const TestDriveByDay = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/contacts/test-drives");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Lỗi fetch:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FIX TIMEZONE (QUAN TRỌNG)
  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-CA"); // yyyy-mm-dd
  };

  // 🔥 GROUP DATA
  const grouped = useMemo(() => {
    const result = {};

    data.forEach((item) => {
      const date = formatDate(item.date);

      if (selectedDate && date !== selectedDate) return;

      const carName =
        item.inventoryId?.variantId?.modelId?.name +
        " - " +
        item.inventoryId?.variantId?.variantName;

      if (!result[date]) result[date] = {};
      if (!result[date][carName]) result[date][carName] = [];

      result[date][carName].push(item);
    });

    return result;
  }, [data, selectedDate]);

  // ✅ FIX UPDATE + UI UPDATE NGAY
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/contacts/test-drive/${id}`, { status });

      // 🔥 update UI ngay không cần reload
      setData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Update thất bại");
    }
  };

  // 🎨 màu theo status
  const getStatusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Confirmed") return "bg-blue-100 text-blue-700";
    if (status === "Completed") return "bg-green-100 text-green-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Quản lý lái thử theo ngày 🚗
        </h1>

        {/* FILTER DATE */}
        <input
          type="date"
          className="border px-3 py-2 mb-6"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* DATA */}
        {Object.keys(grouped).length === 0 && (
          <div>Chưa có xe nào được đăng ký lái thử trong ngày này!</div>
        )}

        {Object.entries(grouped).map(([date, cars]) => (
          <div key={date} className="mb-8">

            {/* DATE */}
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              📅 {date}
            </h2>

            {/* CAR LIST */}
            {Object.entries(cars).map(([carName, bookings]) => (
              <div
                key={carName}
                className="bg-white rounded-xl shadow p-4 mb-4"
              >
                <h3 className="font-bold text-lg mb-3">
                  🚗 {carName}
                </h3>

                <div className="space-y-2">
                  {bookings
                    .sort((a, b) =>
                      a.timeSlot.localeCompare(b.timeSlot)
                    )
                    .map((b) => (
                      <div
                        key={b._id}
                        className="flex justify-between items-center border p-3 rounded"
                      >
                        <div>
                          <div className="font-semibold">
                            {b.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {b.phone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.timeSlot}
                          </div>

                          {/* ✅ HIỂN THỊ STATUS */}
                          <div
                            className={`text-xs mt-1 px-2 py-1 inline-block rounded ${getStatusColor(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateStatus(b._id, "Confirmed")
                            }
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                          >
                            OK
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(b._id, "Completed")
                            }
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                          >
                            Done
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(b._id, "Cancelled")
                            }
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDriveByDay;