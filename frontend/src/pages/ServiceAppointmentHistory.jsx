import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_META = {
  Held: { label: "Đang giữ chỗ", className: "bg-cyan-100 text-cyan-800" },
  AwaitingPayment: { label: "Chờ thanh toán cọc", className: "bg-amber-100 text-amber-800" },
  Confirmed: { label: "Đã xác nhận", className: "bg-emerald-100 text-emerald-800" },
  InService: { label: "Đang bảo dưỡng", className: "bg-blue-100 text-blue-800" },
  Completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
  Cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
  Expired: { label: "Hết hạn", className: "bg-slate-200 text-slate-700" },
};

const ServiceAppointmentHistory = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingCancellationId, setPendingCancellationId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (!userInfo?.token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let active = true;
    const loadAppointments = async () => {
      try {
        const response = await api.get("/service-appointments/my-history");
        if (active) {
          setAppointments(response.data.data || []);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Không thể tải lịch sử bảo dưỡng");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAppointments();
    const interval = setInterval(loadAppointments, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [navigate]);

  const cancelAppointment = async (appointmentId, confirmDepositForfeiture = false) => {
    setCancellingId(appointmentId);
    setError("");
    try {
      const response = await api.patch(`/service-appointments/my-history/${appointmentId}/cancel`, {
        confirmDepositForfeiture,
      });
      setAppointments((current) => current.map((appointment) =>
        appointment._id === appointmentId ? { ...appointment, ...response.data.data } : appointment
      ));
      setPendingCancellationId(null);
    } catch (requestError) {
      if (requestError.response?.data?.code === "DEPOSIT_FORFEITURE_CONFIRMATION_REQUIRED") {
        setPendingCancellationId(appointmentId);
      } else {
        setError(requestError.response?.data?.message || "Không thể hủy lịch bảo dưỡng");
        setPendingCancellationId(null);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const pendingCancellation = appointments.find((appointment) => appointment._id === pendingCancellationId);

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-28">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          to="/bao-duong"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-blue-950 transition hover:border-blue-950"
        >
          <span aria-hidden="true">←</span> Quay lại đặt lịch bảo dưỡng
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-5">
          <p className="text-xs font-black uppercase tracking-[.25em] text-red-600">Ford Quế Võ Service</p>
          <h1 className="mt-2 text-3xl font-black uppercase italic text-blue-950">Lịch sử đặt lịch bảo dưỡng</h1>
          <p className="mt-2 text-sm text-slate-600">Danh sách lịch hẹn và trạng thái xử lý của bạn.</p>
        </header>

        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center font-bold text-blue-900">Đang tải lịch bảo dưỡng...</div>
        ) : appointments.length === 0 ? (
          <div className="mt-8 border-y border-dashed border-slate-300 py-16 text-center">
            <h2 className="text-lg font-black text-blue-950">Bạn chưa có lịch bảo dưỡng</h2>
            <Link to="/bao-duong" className="mt-5 inline-flex rounded-lg bg-blue-950 px-5 py-3 text-sm font-black uppercase text-white hover:bg-blue-800">
              Đặt lịch bảo dưỡng
            </Link>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-200">
            {appointments.map((appointment) => {
              const selectedPackages = appointment.servicePackages?.length
                ? appointment.servicePackages
                : appointment.servicePackage ? [appointment.servicePackage] : [];
              const status = STATUS_META[appointment.status] || {
                label: appointment.status,
                className: "bg-slate-100 text-slate-700",
              };
              const vehicle = appointment.customerVehicle;

              return (
                <article key={appointment._id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black text-blue-950">
                        {vehicle?.licensePlate || vehicle?.vin || "Xe của tôi"}
                      </h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {vehicle?.modelName || ""} · {new Date(appointment.serviceDate).toLocaleDateString("vi-VN")} · {appointment.timeSlot}
                    </p>
                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{selectedPackages.length} gói dịch vụ</p>
                      <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-800">
                        {selectedPackages.map((servicePackage) => (
                          <li key={servicePackage._id || servicePackage}>{servicePackage.name || "Gói dịch vụ"}</li>
                        ))}
                      </ul>
                    </div>
                    {appointment.notes && <p className="mt-3 text-sm text-slate-600">Ghi chú: {appointment.notes}</p>}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold uppercase text-slate-500">Tiền cọc</p>
                    <p className="mt-1 text-lg font-black text-red-600">2.000 đ</p>
                    <p className="mt-2 text-xs text-slate-400">Mã lịch: #{appointment._id.slice(-8).toUpperCase()}</p>
                    {["Held", "AwaitingPayment", "Confirmed"].includes(appointment.status) && (
                      <button
                        type="button"
                        disabled={cancellingId === appointment._id}
                        onClick={() => cancelAppointment(appointment._id)}
                        className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {cancellingId === appointment._id ? "Đang xử lý..." : "Hủy lịch"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      {pendingCancellation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-appointment-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="cancel-appointment-title" className="text-xl font-black text-blue-950">Xác nhận hủy lịch</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Lịch hẹn còn dưới 2 tiếng. Nếu hủy lúc này, bạn sẽ mất khoản cọc 2.000 đ.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancellingId === pendingCancellationId}
                onClick={() => setPendingCancellationId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Giữ nguyên lịch
              </button>
              <button
                type="button"
                disabled={cancellingId === pendingCancellationId}
                onClick={() => cancelAppointment(pendingCancellationId, true)}
                className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {cancellingId === pendingCancellationId ? "Đang xử lý..." : "Chấp nhận mất cọc"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default ServiceAppointmentHistory;