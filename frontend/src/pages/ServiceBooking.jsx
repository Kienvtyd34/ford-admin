import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const BANK_ID = process.env.REACT_APP_SEPAY_BANK_ID;
const ACCOUNT_NO = process.env.REACT_APP_SEPAY_ACCOUNT_NO;
const ACCOUNT_NAME = process.env.REACT_APP_SEPAY_ACCOUNT_NAME;

const emptyVehicle = {
  licensePlate: "",
  vin: "",
  modelName: "",
  variantName: "",
  color: "",
  currentMileage: "",
};

const DEFAULT_SERVICE_PACKAGES = [
  { _id: "default-basic", name: "Bảo dưỡng cơ bản", category: "Bảo dưỡng định kỳ", price: 990000, durationMinutes: 60 },
  { _id: "default-periodic", name: "Bảo dưỡng định kỳ", category: "Bảo dưỡng định kỳ", price: 1490000, durationMinutes: 90 },
  { _id: "default-advanced", name: "Bảo dưỡng nâng cao", category: "Bảo dưỡng định kỳ", price: 2490000, durationMinutes: 150 },
  { _id: "default-5000", name: "Bảo dưỡng 5.000 km", category: "Bảo dưỡng định kỳ", price: 1990000, durationMinutes: 120 },
  { _id: "default-10000", name: "Bảo dưỡng 10.000 km", category: "Bảo dưỡng định kỳ", price: 2990000, durationMinutes: 150 },
  { _id: "default-20000", name: "Bảo dưỡng 20.000 km", category: "Bảo dưỡng định kỳ", price: 4990000, durationMinutes: 180 },
  { _id: "default-40000", name: "Bảo dưỡng 40.000 km", category: "Bảo dưỡng định kỳ", price: 6990000, durationMinutes: 240 },
  { _id: "default-60000", name: "Bảo dưỡng 60.000 km", category: "Bảo dưỡng định kỳ", price: 8990000, durationMinutes: 300 },
  { _id: "default-check-general", name: "Kiểm tra tổng quát xe", category: "Gói kiểm tra – chẩn đoán", price: 590000, durationMinutes: 45 },
  { _id: "default-check-trip", name: "Kiểm tra xe trước chuyến đi", category: "Gói kiểm tra – chẩn đoán", price: 790000, durationMinutes: 60 },
  { _id: "default-diagnostic", name: "Chẩn đoán lỗi điện tử", category: "Gói kiểm tra – chẩn đoán", price: 1390000, durationMinutes: 90 },
  { _id: "default-engine", name: "Kiểm tra động cơ", category: "Gói kiểm tra – chẩn đoán", price: 1090000, durationMinutes: 75 },
  { _id: "default-electrical", name: "Kiểm tra hệ thống điện", category: "Gói kiểm tra – chẩn đoán", price: 850000, durationMinutes: 60 },
  { _id: "default-brake", name: "Kiểm tra hệ thống phanh", category: "Gói kiểm tra – chẩn đoán", price: 950000, durationMinutes: 75 },
  { _id: "default-suspension", name: "Kiểm tra gầm và hệ thống treo", category: "Gói kiểm tra – chẩn đoán", price: 1190000, durationMinutes: 90 },
  { _id: "default-repair-brake", name: "Sửa chữa hệ thống phanh", category: "Gói sửa chữa", price: 2590000, durationMinutes: 180 },
  { _id: "default-repair-suspension", name: "Sửa chữa hệ thống treo", category: "Gói sửa chữa", price: 2990000, durationMinutes: 180 },
  { _id: "default-repair-steering", name: "Sửa chữa hệ thống lái", category: "Gói sửa chữa", price: 3190000, durationMinutes: 210 },
  { _id: "default-repair-engine", name: "Sửa chữa động cơ", category: "Gói sửa chữa", price: 4990000, durationMinutes: 300 },
  { _id: "default-repair-electrical", name: "Sửa chữa hệ thống điện", category: "Gói sửa chữa", price: 3490000, durationMinutes: 210 },
  { _id: "default-repair-ac", name: "Sửa chữa điều hòa", category: "Gói sửa chữa", price: 2890000, durationMinutes: 180 },
  { _id: "default-oil-change", name: "Thay dầu động cơ", category: "Gói sửa chữa", price: 990000, durationMinutes: 60 },
  { _id: "default-oil-filter", name: "Thay lọc dầu", category: "Gói sửa chữa", price: 450000, durationMinutes: 30 },
  { _id: "default-air-filter-engine", name: "Thay lọc gió động cơ", category: "Gói sửa chữa", price: 550000, durationMinutes: 45 },
  { _id: "default-air-filter-ac", name: "Thay lọc gió điều hòa", category: "Gói sửa chữa", price: 650000, durationMinutes: 45 },
  { _id: "default-battery", name: "Thay ắc quy", category: "Gói sửa chữa", price: 1800000, durationMinutes: 60 },
  { _id: "default-brake-pad", name: "Thay má phanh", category: "Gói sửa chữa", price: 2190000, durationMinutes: 150 },
  { _id: "default-wash", name: "Rửa xe", category: "Gói chăm sóc xe", price: 390000, durationMinutes: 60 },
  { _id: "default-interior", name: "Vệ sinh nội thất", category: "Gói chăm sóc xe", price: 850000, durationMinutes: 90 },
  { _id: "default-engine-clean", name: "Vệ sinh khoang động cơ", category: "Gói chăm sóc xe", price: 1490000, durationMinutes: 120 },
  { _id: "default-ac-clean", name: "Vệ sinh hệ thống điều hòa", category: "Gói chăm sóc xe", price: 990000, durationMinutes: 90 },
  { _id: "default-polish", name: "Chăm sóc và đánh bóng xe", category: "Gói chăm sóc xe", price: 1290000, durationMinutes: 120 },
  { _id: "default-odor", name: "Khử mùi nội thất", category: "Gói chăm sóc xe", price: 700000, durationMinutes: 60 },
  { _id: "default-tire", name: "Chăm sóc lốp và mâm xe", category: "Gói chăm sóc xe", price: 850000, durationMinutes: 60 },
  { _id: "default-free-check", name: "Kiểm tra xe miễn phí", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 30 },
  { _id: "default-consult", name: "Tư vấn bảo dưỡng", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 30 },
  { _id: "default-rescue", name: "Cứu hộ xe", category: "Gói dịch vụ tiện ích", price: 990000, durationMinutes: 60 },
  { _id: "default-home-support", name: "Hỗ trợ xe tại nhà", category: "Gói dịch vụ tiện ích", price: 1490000, durationMinutes: 90 },
  { _id: "default-booking", name: "Đặt lịch bảo dưỡng", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 15 },
  { _id: "default-reminder", name: "Nhắc lịch bảo dưỡng định kỳ", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 15 },
];

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN").format(value || 0);

const statusMeta = {
  AwaitingPayment: { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-700" },
  Confirmed: { label: "Đã xác nhận", className: "bg-emerald-100 text-emerald-700" },
  InService: { label: "Đang bảo dưỡng", className: "bg-blue-100 text-blue-700" },
  Completed: { label: "Hoàn thành", className: "bg-violet-100 text-violet-700" },
  Cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
  Expired: { label: "Hết hạn", className: "bg-slate-200 text-slate-600" },
  Held: { label: "Đã giữ chỗ", className: "bg-cyan-100 text-cyan-700" },
};

const ServiceBooking = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [payment, setPayment] = useState(null);
  const [paymentMeta, setPaymentMeta] = useState(null);
  const [appointmentDraft, setAppointmentDraft] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const qrUrl = paymentMeta && BANK_ID && ACCOUNT_NO
    ? `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${paymentMeta.amount}&addInfo=${encodeURIComponent(paymentMeta.transferCode)}&accountName=${encodeURIComponent(ACCOUNT_NAME || "")}`
    : null;

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (!userInfo?.token) {
      navigate("/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const [vehicleRes, packageRes, appointmentRes] = await Promise.all([
          api.get("/customer-vehicles"),
          api.get("/service-packages"),
          api.get("/service-appointments/my-history"),
        ]);

        const fallbackPackages = Array.isArray(packageRes?.data?.data) && packageRes.data.data.length > 0
          ? packageRes.data.data
          : DEFAULT_SERVICE_PACKAGES;

        setVehicles(vehicleRes.data.data || []);
        setPackages(fallbackPackages);
        setAppointments(appointmentRes.data.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải dữ liệu bảo dưỡng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    const loadSlots = async () => {
      try {
        const response = await api.get(`/service-appointments/slots?date=${date}`);
        setSlots(response.data.data || []);
        setTimeSlot("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải khung giờ");
      }
    };
    loadSlots();
  }, [date]);

  const handleCreateVehicle = async (event) => {
    event.preventDefault();
    setSavingVehicle(true);
    setError("");
    try {
      const response = await api.post("/customer-vehicles", vehicleForm);
      const vehicle = response.data.data;
      setVehicles((current) => [vehicle, ...current]);
      setSelectedVehicle(vehicle._id);
      setVehicleForm(emptyVehicle);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể lưu thông tin xe");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleReviewAppointment = (event) => {
    event.preventDefault();

    if (!selectedVehicle || !selectedPackage || !date || !timeSlot) {
      setError("Vui lòng chọn xe, gói dịch vụ, ngày và khung giờ");
      return;
    }

    const vehicle = vehicles.find((item) => item._id === selectedVehicle);
    const servicePackage = packages.find((item) => item._id === selectedPackage);

    if (!vehicle || !servicePackage) {
      setError("Thông tin xe hoặc gói dịch vụ không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setAppointmentDraft({
      vehicle,
      servicePackage,
      date,
      timeSlot,
      notes,
    });
    setError("");
    setShowReview(true);
  };

  const handleCreateAppointment = async () => {
    if (!selectedVehicle || !selectedPackage || !date || !timeSlot) {
      setError("Vui lòng chọn xe, gói dịch vụ, ngày và khung giờ");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const response = await api.post("/service-appointments", {
        customerVehicleId: selectedVehicle,
        servicePackageId: selectedPackage,
        date,
        timeSlot,
        notes,
      });

      const { appointment, payment: createdPayment, transferCode, holdExpiresAt, depositAmount } = response.data.data;

      const paymentData = {
        ...createdPayment,
        amount: depositAmount || createdPayment.amount,
        transferCode,
        holdExpiresAt,
      };

      setPayment(createdPayment);
      setPaymentMeta(paymentData);
      setAppointments((current) => [appointment, ...current]);
      setShowReview(false);
      setAppointmentDraft(null);
      setTimeSlot("");
      setNotes("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể giữ lịch bảo dưỡng");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 pt-32 text-center font-bold text-blue-900">Đang tải dịch vụ...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Ford Quế Võ Service</p>
          <h1 className="mt-3 text-4xl font-black uppercase italic text-blue-950">Đặt lịch bảo dưỡng</h1>
          <p className="mt-3 max-w-xl text-slate-600">Chọn xe, gói dịch vụ và khung giờ phù hợp. Lịch sẽ được giữ tạm thời để bạn thanh toán tiền cọc.</p>

          {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

          {!showReview ? (
            <form onSubmit={handleReviewAppointment} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-bold text-slate-700">Xe của bạn
                <select value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3">
                  <option value="">-- Chọn xe --</option>
                  {vehicles.map((vehicle) => <option key={vehicle._id} value={vehicle._id}>{vehicle.licensePlate || vehicle.vin} {vehicle.modelName ? `- ${vehicle.modelName}` : ""}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">Gói dịch vụ
                <select value={selectedPackage} onChange={(event) => setSelectedPackage(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3">
                  <option value="">-- Chọn gói --</option>
                  {packages.map((item) => <option key={item._id} value={item._id}>{item.name} - {formatMoney(item.price)} đ</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">Ngày bảo dưỡng<input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3" /></label>
                <label className="text-sm font-bold text-slate-700">Khung giờ<select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3"><option value="">-- Chọn slot --</option>{slots.filter((slot) => slot.available).map((slot) => <option key={slot.timeSlot} value={slot.timeSlot}>{slot.timeSlot}</option>)}</select></label>
              </div>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Mô tả vấn đề cần kiểm tra (không bắt buộc)" className="min-h-24 w-full rounded-lg border border-slate-200 p-3" />
              <button type="submit" className="w-full rounded-lg bg-blue-950 px-5 py-3 font-black uppercase tracking-wide text-white hover:bg-blue-800">Tiếp tục</button>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.25em] text-red-600">Xác nhận lịch</p>
                  <h2 className="mt-2 text-2xl font-black uppercase text-blue-950">Kiểm tra lại thông tin</h2>
                </div>
              </div>

              {appointmentDraft && (
                <div className="mt-5 space-y-4 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Xe</p>
                    <p className="mt-2 text-base font-bold text-blue-950">{appointmentDraft.vehicle.licensePlate || appointmentDraft.vehicle.vin} {appointmentDraft.vehicle.modelName ? `- ${appointmentDraft.vehicle.modelName}` : ""}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Gói dịch vụ</p>
                      <p className="mt-2 text-base font-bold text-blue-950">{appointmentDraft.servicePackage.name}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Tiền cọc</p>
                      <p className="mt-2 text-base font-bold text-red-600">{formatMoney(appointmentDraft.servicePackage.deposit || 0)} đ</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Ngày</p>
                      <p className="mt-2 text-base font-bold text-blue-950">{new Date(`${appointmentDraft.date}T00:00:00`).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Giờ</p>
                      <p className="mt-2 text-base font-bold text-blue-950">{appointmentDraft.timeSlot}</p>
                    </div>
                  </div>

                  {appointmentDraft.notes && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Ghi chú</p>
                      <p className="mt-2 text-base text-slate-700">{appointmentDraft.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-5 py-3 font-black uppercase text-slate-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleCreateAppointment}
                  disabled={creating}
                  className="flex-1 rounded-lg bg-blue-950 px-5 py-3 font-black uppercase text-white disabled:opacity-60"
                >
                  {creating ? "Đang giữ lịch..." : "Xác nhận giữ lịch"}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateVehicle} className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
            <h2 className="text-lg font-black uppercase text-blue-950">Thêm xe mới</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input required placeholder="Biển số xe *" value={vehicleForm.licensePlate} onChange={(event) => setVehicleForm({ ...vehicleForm, licensePlate: event.target.value })} className="rounded-lg border border-slate-200 p-3" />
              <input placeholder="Số VIN" value={vehicleForm.vin} onChange={(event) => setVehicleForm({ ...vehicleForm, vin: event.target.value })} className="rounded-lg border border-slate-200 p-3" />
              <input placeholder="Dòng xe" value={vehicleForm.modelName} onChange={(event) => setVehicleForm({ ...vehicleForm, modelName: event.target.value })} className="rounded-lg border border-slate-200 p-3" />
              <input placeholder="Số km hiện tại" type="number" min="0" value={vehicleForm.currentMileage} onChange={(event) => setVehicleForm({ ...vehicleForm, currentMileage: event.target.value })} className="rounded-lg border border-slate-200 p-3" />
            </div>
            <button type="submit" disabled={savingVehicle} className="mt-4 rounded-lg border border-blue-950 px-5 py-3 text-sm font-black uppercase text-blue-950 disabled:opacity-60">{savingVehicle ? "Đang lưu..." : "Lưu xe"}</button>
          </form>
        </section>

        <aside className="space-y-6">
          {paymentMeta && (
            <div className="rounded-2xl border-t-8 border-green-600 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black uppercase text-blue-950">Chờ thanh toán cọc</h2>
              <p className="mt-2 text-sm text-slate-600">Lịch của bạn đã được giữ tạm thời. Vui lòng thanh toán đúng số tiền và nội dung chuyển khoản để xác nhận lịch.</p>
              {qrUrl ? (
                <img src={qrUrl} alt="QR thanh toán tiền cọc dịch vụ" className="mx-auto mt-5 w-full max-w-xs rounded-xl" />
              ) : (
                <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">Chưa cấu hình thông tin QR trên frontend. Dùng mã chuyển khoản bên dưới.</p>
              )}
              <div className="mt-4 rounded-lg bg-slate-100 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Nội dung chuyển khoản</p>
                <p className="mt-2 font-mono text-base font-black text-blue-950">{paymentMeta.transferCode}</p>
              </div>
              <div className="mt-3 text-center">
                <p className="text-2xl font-black text-red-600">{formatMoney(paymentMeta.amount)} đ</p>
                <p className="mt-2 text-xs text-slate-500">Giữ lịch đến: {new Date(paymentMeta.holdExpiresAt).toLocaleString("vi-VN")}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-blue-950 p-6 text-white">
            <h2 className="text-xl font-black uppercase">Lịch của tôi</h2>
            <div className="mt-5 space-y-3">
              {appointments.length === 0 ? (
                <p className="text-sm text-blue-100">Chưa có lịch bảo dưỡng.</p>
              ) : (
                appointments.slice(0, 5).map((item) => {
                  const status = statusMeta[item.status] || { label: item.status, className: "bg-slate-100 text-slate-600" };
                  return (
                    <div key={item._id} className="rounded-xl bg-white/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{item.servicePackage?.name || "Gói dịch vụ"}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="mt-2 text-sm text-blue-100">{new Date(item.serviceDate).toLocaleDateString("vi-VN")} · {item.timeSlot}</p>
                    </div>
                  );
                })
              )}
            </div>
            <Link to="/booking-history" className="mt-5 inline-block text-sm font-bold text-red-200 hover:text-white">Xem lịch sử đặt cọc xe →</Link>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default ServiceBooking;
