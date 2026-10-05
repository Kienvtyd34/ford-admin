import React, { useEffect, useState } from "react";
import api from "../api/axios";

const EMPTY_PACKAGE = { name: "", description: "", category: "Bảo dưỡng định kỳ", price: "", durationMinutes: 60 };
const STATUS_STYLES = {
  AwaitingPayment: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  InService: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Expired: "bg-slate-100 text-slate-600",
};

const ServiceManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(EMPTY_PACKAGE);
  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isAdmin = JSON.parse(localStorage.getItem("userInfo") || "null")?.user?.role === "admin";

  const loadData = async () => {
    setLoading(true);
    try {
      const requests = [api.get("/service-appointments")];
      if (isAdmin) requests.push(api.get("/service-packages/admin"));
      const responses = await Promise.all(requests);
      setAppointments(responses[0].data.data || []);
      if (isAdmin) setPackages(responses[1].data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể tải dữ liệu bảo dưỡng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/service-appointments/${id}/status`, { status });
      setAppointments((items) => items.map((item) => item._id === id ? { ...item, ...response.data.data } : item));
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const savePackage = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) };
      const response = editingId
        ? await api.patch(`/service-packages/${editingId}`, payload)
        : await api.post("/service-packages", payload);
      setPackages((items) => editingId ? items.map((item) => item._id === editingId ? response.data.data : item) : [response.data.data, ...items]);
      setForm(EMPTY_PACKAGE);
      setEditingId(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể lưu gói dịch vụ");
    } finally {
      setSaving(false);
    }
  };

  const hidePackage = async (id) => {
    if (!window.confirm("Ngừng hiển thị gói dịch vụ này?")) return;
    try {
      const response = await api.delete(`/service-packages/${id}`);
      setPackages((items) => items.map((item) => item._id === id ? response.data.data : item));
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể ngừng gói dịch vụ");
    }
  };

  const visibleAppointments = appointments.filter((item) => !date || new Date(item.serviceDate).toISOString().slice(0, 10) === date);

  return (
    <div className="space-y-8">
      <header><p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Service operations</p><h1 className="mt-2 text-3xl font-black uppercase italic text-blue-950">Quản lý bảo dưỡng</h1><p className="mt-1 text-sm text-slate-500">Theo dõi lịch hẹn, thanh toán cọc và trạng thái phục vụ.</p></header>
      {message && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{message}</div>}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5"><div><h2 className="text-xl font-black text-blue-950">Lịch bảo dưỡng</h2><p className="text-xs text-slate-500">{visibleAppointments.length} lịch</p></div><div className="flex gap-3"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border p-2 text-sm" /><button onClick={loadData} className="rounded-lg bg-blue-950 px-4 py-2 text-xs font-black uppercase text-white">Tải lại</button></div></div>
        {loading ? <div className="p-10 text-center font-bold text-slate-400">Đang tải dữ liệu...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Ngày / giờ</th><th className="p-4">Khách hàng</th><th className="p-4">Xe</th><th className="p-4">Gói dịch vụ</th><th className="p-4">Trạng thái</th><th className="p-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleAppointments.map((item) => <tr key={item._id}><td className="p-4 font-bold text-blue-950">{new Date(item.serviceDate).toLocaleDateString("vi-VN")}<br /><span className="text-xs text-slate-500">{item.timeSlot}</span></td><td className="p-4">{item.user?.fullName || "---"}<br /><span className="text-xs text-slate-500">{item.user?.phone || item.user?.email || ""}</span></td><td className="p-4">{item.customerVehicle?.licensePlate || item.customerVehicle?.vin || "---"}<br /><span className="text-xs text-slate-500">{item.customerVehicle?.modelName || ""}</span></td><td className="p-4">{item.servicePackage?.name || "---"}</td><td className="p-4"><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[item.status] || "bg-slate-100 text-slate-600"}`}>{item.status}</span></td><td className="p-4"><div className="flex gap-2">{item.status === "Confirmed" && <button onClick={() => updateStatus(item._id, "InService")} className="rounded bg-indigo-600 px-2 py-1 text-xs font-bold text-white">Đang làm</button>}{item.status === "InService" && <button onClick={() => updateStatus(item._id, "Completed")} className="rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">Hoàn tất</button>}{["Held", "AwaitingPayment", "Confirmed"].includes(item.status) && <button onClick={() => updateStatus(item._id, "Cancelled")} className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">Hủy</button>}</div></td></tr>)}</tbody></table>{!visibleAppointments.length && <div className="p-10 text-center text-sm text-slate-400">Chưa có lịch bảo dưỡng.</div>}</div>}
      </section>
      {isAdmin && <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><form onSubmit={savePackage} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-black text-blue-950">{editingId ? "Sửa gói dịch vụ" : "Thêm gói dịch vụ"}</h2><div className="mt-4 space-y-3"><input required placeholder="Tên gói" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border p-3" /><input required placeholder="Danh mục" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border p-3" /><textarea placeholder="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full rounded-lg border p-3" /><div className="grid grid-cols-2 gap-3"><input required type="number" min="0" placeholder="Giá" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="rounded-lg border p-3" /><input required type="number" min="15" placeholder="Số phút" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} className="rounded-lg border p-3" /></div></div><div className="mt-4 flex gap-2"><button disabled={saving} className="rounded-lg bg-blue-950 px-4 py-3 text-xs font-black uppercase text-white">{saving ? "Đang lưu..." : "Lưu gói"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_PACKAGE); }} className="rounded-lg border px-4 py-3 text-xs font-black uppercase">Hủy</button>}</div></form><div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><h2 className="border-b p-5 text-xl font-black text-blue-950">Danh sách gói</h2><div className="divide-y">{packages.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-black text-blue-950">{item.name}</p><p className="text-xs text-slate-500">{item.category} · {item.durationMinutes} phút · {Number(item.price).toLocaleString("vi-VN")} đ</p></div><div className="flex gap-2"><button onClick={() => { setEditingId(item._id); setForm({ ...item, price: String(item.price), durationMinutes: String(item.durationMinutes) }); }} className="rounded border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">Sửa</button>{item.isActive && <button onClick={() => hidePackage(item._id)} className="rounded border border-red-200 px-3 py-1 text-xs font-bold text-red-700">Ngừng</button>}</div></div>)}</div></div></section>}
    </div>
  );
};

export default ServiceManagement;
