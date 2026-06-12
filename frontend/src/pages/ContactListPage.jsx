import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contactPage, setContactPage] = useState(1);

const CONTACTS_PER_PAGE = 25;

const totalContactPages = Math.ceil(
  contacts.length / CONTACTS_PER_PAGE
);

const currentContacts = contacts.slice(
  (contactPage - 1) * CONTACTS_PER_PAGE,
  contactPage * CONTACTS_PER_PAGE
);
  const navigate = useNavigate();

  // ===== USER =====
  const getLoggedInUser = () => {
    const storedData = localStorage.getItem('userInfo');
    if (!storedData) return null;
    const parsed = JSON.parse(storedData);
    return parsed.user || parsed;
  };

  // ===== FETCH DATA =====
  const fetchData = async () => {
    try {
      const [contactRes, bookingRes] = await Promise.all([
        api.get('/contacts/contacts'), // ✅ đúng route backend
        api.get('/bookings')
      ]);

      setContacts(contactRes.data.data || []);
      setBookings(bookingRes.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== FILTER BOOKING =====
  const displayBookings = bookings.filter((b) => {
    if (b.paymentStatus === 'Paid' || b.orderStatus === 'Completed') return true;
    const hoursDiff = (new Date() - new Date(b.createdAt)) / (1000 * 60 * 60);
    return hoursDiff < 24;
  });

  // ===== CONFIRM DELIVERY =====
  const handleConfirmDelivery = async (bookingId, paymentMethod) => {
    const currentUser = getLoggedInUser();

    if (!currentUser) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }

    if (!window.confirm(`Xác nhận giao xe bởi: ${currentUser.fullName}?`)) return;

    try {
      await api.post(`/vehicles/confirm-delivery/${bookingId}`, {
        paymentMethod
      });

      alert("Giao xe thành công!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi!");
    }
  };

  // ===== UPDATE CONTACT =====
  const handleUpdateContactStatus = async (id) => {
    try {
      await api.put(`/contacts/${id}/status`, {
        status: 'Đã hoàn thành' // ✅ đúng enum backend
      });
      fetchData();
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  // ===== NAVIGATE =====
  const handleGoToStaff = (fullName) => {
    if (!fullName) return;
    const user = getLoggedInUser();
    const role = user?.role || "";

    if (role.toLowerCase() === 'admin') {
      navigate('/admin/hr-management', { state: { highlightName: fullName } });
    } else {
      navigate('/admin/customer-info', { state: { highlightName: fullName } });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* ================= BOOKING ================= */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🚗 Thanh toán & Giao xe</h2>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="p-3">Khách</th>
                  <th className="p-3">Xe</th>
                  <th className="p-3">VIN</th>
                  <th className="p-3">Cọc</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Giao xe</th>
                  <th className="p-3">Nhân viên</th>
                </tr>
              </thead>

              <tbody>
                {displayBookings.map((b) => (
                  <tr key={b._id} className="border-b">
                    <td className="p-3 cursor-pointer"
                        onClick={() => handleGoToStaff(b.user?.fullName)}>
                      <div className="font-bold">{b.user?.fullName}</div>
                      <div className="text-xs text-gray-500">{b.user?.phone}</div>
                    </td>

                    <td className="p-3">
                      {b.vehicle?.variantId?.modelId?.name || "---"}
                      <br />
                      <span className="text-xs text-gray-500">
                        {b.variantName} - {b.colorName}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-xs">
                      {b.vin || "---"}
                    </td>

                    <td className="p-3 text-red-600 font-bold">
                      {b.depositAmount?.toLocaleString()}đ
                    </td>

                    <td className="p-3">{b.orderStatus}</td>

                    <td className="p-3">
                      {b.orderStatus === 'Completed' ? (
                        "Đã giao"
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmDelivery(b._id, 'Tiền mặt')}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Tiền mặt
                          </button>
                          <button
                            onClick={() => handleConfirmDelivery(b._id, 'Chuyển khoản')}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          >
                            CK
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {b.confirmedBy?.fullName || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section>
          <h2 className="text-2xl font-bold mb-4">📞 Yêu cầu tư vấn</h2>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3">Khách</th>
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Yêu cầu</th>
                  <th className="p-3">Ghi chú</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
  {currentContacts.map((c) => (
    <tr key={c._id} className="border-b">
      <td className="p-3 font-bold">
        {c.fullName}
      </td>

      <td className="p-3">
        {c.phone}
      </td>

      <td className="p-3">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
          {c.requestType}
        </span>
      </td>

      {/* GHI CHÚ */}
      <td className="p-3 max-w-xs truncate">
        {c.message || "-"}
      </td>

      <td className="p-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            c.status === "Đã hoàn thành"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {c.status}
        </span>
      </td>

      <td className="p-3">
        {c.status !== "Đã hoàn thành" && (
          <button
            onClick={() =>
              handleUpdateContactStatus(c._id)
            }
            className="bg-gray-800 text-white px-3 py-1 rounded text-xs"
          >
            Xử lý
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
            </table>
            <div className="flex justify-center items-center gap-2 py-4">

  <button
    disabled={contactPage === 1}
    onClick={() =>
      setContactPage(contactPage - 1)
    }
    className={`px-3 py-1 rounded ${
      contactPage === 1
        ? "bg-gray-200 cursor-not-allowed"
        : "bg-blue-500 text-white"
    }`}
  >
    ← Trước
  </button>

  {Array.from(
    { length: totalContactPages },
    (_, i) => i + 1
  ).map((page) => (
    <button
      key={page}
      onClick={() =>
        setContactPage(page)
      }
      className={`px-3 py-1 rounded ${
        page === contactPage
          ? "bg-blue-600 text-white"
          : "bg-gray-200"
      }`}
    >
      {page}
    </button>
  ))}

  <button
    disabled={
      contactPage === totalContactPages
    }
    onClick={() =>
      setContactPage(contactPage + 1)
    }
    className={`px-3 py-1 rounded ${
      contactPage === totalContactPages
        ? "bg-gray-200 cursor-not-allowed"
        : "bg-blue-500 text-white"
    }`}
  >
    Sau →
  </button>

</div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;