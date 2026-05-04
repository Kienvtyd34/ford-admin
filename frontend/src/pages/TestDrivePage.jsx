import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

const TestDrivePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);

  // 🔥 FILTER STATE
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    date: "",
    timeSlot: ""
  });

  const TIME_SLOTS = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "13:00 - 15:00",
    "15:00 - 17:00"
  ];

  // 🚀 load xe demo
  const fetchDemo = async () => {
    try {
      const res = await api.get("/contacts/demo-vehicles");
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không tải được xe demo");
    }
  };

  useEffect(() => {
    fetchDemo();
  }, []);

  // 🔥 DANH SÁCH FILTER
  const uniqueColors = useMemo(() => {
    return [...new Set(vehicles.map(v => v.color?.name).filter(Boolean))];
  }, [vehicles]);

  const uniqueModels = useMemo(() => {
    return [...new Set(vehicles.map(v => v.modelName).filter(Boolean))];
  }, [vehicles]);

  // 🔥 FILTER LOGIC
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {

      // search theo tên xe
      if (search) {
        const keyword = search.toLowerCase().trim();
        const model = v.modelName?.toLowerCase() || "";
        const variant = v.variantName?.toLowerCase() || "";

        if (!model.includes(keyword) && !variant.includes(keyword)) {
          return false;
        }
      }

      // lọc màu
      if (colorFilter && v.color?.name !== colorFilter) return false;

      // lọc dòng xe
      if (modelFilter && v.modelName !== modelFilter) return false;

      return true;
    });
  }, [vehicles, search, colorFilter, modelFilter]);

  // 🚀 đặt lịch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/contacts/book", {
        ...form,
        inventoryId: selected._id
      });

      alert("Đặt lịch thành công");
      setSelected(null);

      setForm({
        customerName: "",
        phone: "",
        date: "",
        timeSlot: ""
      });

    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Xe lái thử</h2>

      {/* 🔥 FILTER */}
      <div className="flex gap-3 flex-wrap mb-6">

        <input
          placeholder="Tìm tên xe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <select
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="border p-2 rounded-xl"
        >
          <option value="">Dòng xe</option>
          {uniqueModels.map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="border p-2 rounded-xl"
        >
          <option value="">Màu</option>
          {uniqueColors.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setColorFilter("");
            setModelFilter("");
          }}
          className="bg-gray-200 px-3 rounded-xl"
        >
          Reset
        </button>
      </div>

      {/* LIST XE */}
      <div className="grid grid-cols-3 gap-6">
        {filteredVehicles.map(v => (
          <div key={v._id} className="bg-white p-4 rounded-xl shadow">

            <img src={v.image} className="h-40 object-contain mx-auto" />

            <h3 className="font-bold mt-3">
              {v.modelName} {v.variantName}
            </h3>

            <p className="text-sm text-gray-500">
              Màu: {v.color?.name}
            </p>

            <button
              onClick={() => setSelected(v)}
              className="mt-3 w-full bg-blue-900 text-white py-2 rounded"
            >
              Đặt lịch
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">

            <h3 className="font-bold mb-4">
              Đặt lịch: {selected.modelName}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                placeholder="Tên"
                className="w-full border p-2"
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />

              <input
                placeholder="SĐT"
                className="w-full border p-2"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full border p-2"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <select
                className="w-full border p-2"
                value={form.timeSlot}
                onChange={(e) =>
                  setForm({ ...form, timeSlot: e.target.value })
                }
              >
                <option value="">Chọn giờ</option>
                {TIME_SLOTS.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <button className="w-full bg-blue-900 text-white py-2 rounded">
                Xác nhận
              </button>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default TestDrivePage;