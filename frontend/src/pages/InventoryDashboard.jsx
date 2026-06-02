import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#1d4ed8",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#9333ea"
];

const Card = ({ title, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-400">{title}</p>
    <h2 className="text-2xl font-black text-blue-900">
      {value}
    </h2>
  </div>
);

const ShowroomDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/vehicles/dashboard");

      const dashboardData = {
        totalCars: res.data?.data?.totalCars || 0,
        totalValue: res.data?.data?.totalValue || 0,
        deadStock: res.data?.data?.deadStock || [],
        monthlySales: res.data?.data?.monthlySales || [],
        modelStats: res.data?.data?.modelStats || [],
        colorStats: res.data?.data?.colorStats || []
      };

      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard Error:", err);

      setData({
        totalCars: 0,
        totalValue: 0,
        deadStock: [],
        monthlySales: [],
        modelStats: [],
        colorStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-black text-blue-900 mb-6">
        🚗 Showroom Dashboard
      </h1>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <Card
          title="Tổng xe trong kho"
          value={data.totalCars}
        />

        <Card
          title="Tổng giá trị tồn kho"
          value={`${data.totalValue.toLocaleString()} VNĐ`}
        />

        <Card
          title="Xe tồn lâu (>60 ngày)"
          value={data.deadStock.length}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SALES */}

        <div className="bg-white p-5 rounded-2xl shadow">
          <h3 className="font-bold mb-4">
            Doanh số theo tháng
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart data={data.monthlySales}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1d4ed8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MODEL */}

        <div className="bg-white p-5 rounded-2xl shadow">
          <h3 className="font-bold mb-4">
            Tồn kho theo dòng xe
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={data.modelStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="value">
                {data.modelStats.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* COLOR */}

        <div className="bg-white p-5 rounded-2xl shadow lg:col-span-2">

          <h3 className="font-bold mb-4">
            Thống kê màu xe
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>

              <Pie
                data={data.colorStats}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {data.colorStats.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* DEAD STOCK */}

      <div className="mt-8 bg-white p-5 rounded-2xl shadow">

        <h3 className="font-bold mb-4 text-red-600">
          ⚠️ Xe tồn kho lâu
        </h3>

        {data.deadStock.length === 0 ? (
          <p className="text-gray-500">
            Không có xe tồn kho lâu.
          </p>
        ) : (
          data.deadStock.map((item) => (
            <div
              key={item._id}
              className="border-b py-2 text-sm"
            >
              <div>
                VIN: {item.vin}
              </div>

              <div className="text-gray-500">
                {item.variantId?.modelId?.name || ""}
              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default ShowroomDashboard;