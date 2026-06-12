import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#7c3aed",
  "#0891b2",
  "#ea580c"
];

const StatCard = ({
  title,
  value,
  color = "text-blue-900"
}) => (
  <div className="bg-white rounded-2xl p-6 shadow border">
    <div className="text-gray-500 text-sm">
      {title}
    </div>

    <div
      className={`text-3xl font-black mt-2 ${color}`}
    >
      {value}
    </div>
  </div>
);

const StaffDashboard = () => {
  const [loading, setLoading] =
    useState(true);

  const [dashboard, setDashboard] =
    useState({
      totalMonthlyRevenue: 0,
      totalCarsSold: 0,
      totalStaffCount: 0,
      topSalesPerson: null,
      monthlyRevenue: [],
      staffStats: []
    });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {

      const res =
        await api.get("/vehicles/dashboard");

      const d = res.data.data;

setDashboard({
  totalMonthlyRevenue: d.monthlyRevenue || 0,
  totalCarsSold: d.totalSold || 0,
  totalStaffCount: d.staffStats?.length || 0,
  topSalesPerson: d.staffStats?.[0] || null,
  monthlyRevenue: d.monthlySales || [],
  staffStats: d.staffStats || []
});

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Đang tải dashboard...
      </div>
    );
  }

  const pieData =
    dashboard.staffStats.map((s) => ({
      name: s.name,
      value: s.carsSold
    }));

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-4xl font-black text-blue-900">
          📊 Dashboard Kinh Doanh
        </h1>

        <p className="text-gray-500 mt-2">
          Thống kê doanh số nhân viên &
          doanh thu showroom
        </p>

      </div>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <StatCard
          title="Doanh thu tháng"
          value={`${(dashboard.totalMonthlyRevenue || 0).toLocaleString()} VNĐ`}
          color="text-green-600"
        />

        <StatCard
          title="Xe đã bán"
          value={dashboard.totalCarsSold}
          color="text-blue-600"
        />

        <StatCard
          title="Tổng nhân viên"
          value={dashboard.totalStaffCount}
          color="text-purple-600"
        />

        <StatCard
          title="Top Sales"
          value={
            dashboard.topSalesPerson?.name ||
            "N/A"
          }
          color="text-red-600"
        />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* REVENUE */}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="font-bold text-lg mb-4">
            Doanh thu theo tháng
          </h3>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <AreaChart
              data={dashboard.monthlyRevenue}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Area
                type="monotone"
                dataKey="revenue"
                fill="#60a5fa"
                stroke="#2563eb"
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* SALES STAFF */}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="font-bold text-lg mb-4">
            Doanh số theo nhân viên
          </h3>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <BarChart
              data={dashboard.staffStats}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Bar
                dataKey="revenue"
                radius={[8, 8, 0, 0]}
              >
                {dashboard.staffStats.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Bar>

            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* PIE + TABLE */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

        {/* PIE */}

        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="font-bold text-lg mb-4">
            Tỷ lệ xe bán theo nhân viên
          </h3>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {pieData.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow p-6 xl:col-span-2">

          <h3 className="font-bold text-lg mb-4">
            Bảng xếp hạng nhân viên
          </h3>

          <table className="w-full">

            <thead>

              <tr className="border-b text-left">

                <th className="pb-3">
                  Nhân viên
                </th>

                <th className="pb-3">
                  Xe bán
                </th>

                <th className="pb-3">
                  Doanh thu
                </th>

              </tr>

            </thead>

            <tbody>

              {[...dashboard.staffStats]
                .sort(
                  (a, b) =>
                    b.totalRevenue -
                    a.totalRevenue
                )
                .map((staff, index) => (
                  <tr
                    key={index}
                    className="border-b"
                  >
                    <td className="py-4 font-semibold">
                      {staff.name}
                    </td>

                    <td className="py-4">
                      {staff.carsSold}
                    </td>

                    <td className="py-4 text-green-600 font-bold">
                      {(staff.revenue || 0).toLocaleString()} VNĐ
                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default StaffDashboard;