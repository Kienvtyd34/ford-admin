import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BookingModal from "../components/BookingModal";

const FALLBACK_IMG =
  "https://via.placeholder.com/500x300?text=No+Image";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [activeImage, setActiveImage] =
    useState(FALLBACK_IMG);

  const [activeTab, setActiveTab] =
    useState("info");

  const [isBookingOpen, setIsBookingOpen] =
    useState(false);

  const [showLoginModal, setShowLoginModal] =
    useState(false);

  // ================= HD IMAGE =================
  const getHDImage = (url) => {
    if (!url) return FALLBACK_IMG;

    return url.replace(
      "/upload/",
      "/upload/q_100,f_auto/"
    );
  };

  // ================= CHECK LOGIN =================
  const handleOpenBooking = () => {
    const userInfo =
      localStorage.getItem("userInfo");

    if (!userInfo) {
      setShowLoginModal(true);
      return;
    }

    try {
      const parsed = JSON.parse(userInfo);

      if (!parsed?.token) {
        setShowLoginModal(true);
        return;
      }

      setIsBookingOpen(true);

    } catch (err) {
      setShowLoginModal(true);
    }
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res =
          await api.get(`/vehicles/detail/${id}`);

        const data = res.data.data;

        setVehicle(data);

        const firstVariant =
          data?.variants?.[0] || null;

        const firstColor =
          firstVariant?.colors?.[0] || null;

        setSelectedVariant(firstVariant);
        setSelectedColor(firstColor);

        setActiveImage(
          firstColor?.images?.[0] ||
            data.imageUrl ||
            FALLBACK_IMG
        );

      } catch (err) {
        console.error(
          "FETCH VEHICLE DETAIL ERROR:",
          err
        );
      }
    };

    fetchData();

  }, [id]);

  // ================= LOADING =================
  if (!vehicle) {
    return (
      <div className="text-center py-20">
        Loading...
      </div>
    );
  }

  // ================= IMAGES =================
  const images =
    selectedColor?.images?.length > 0
      ? selectedColor.images
      : vehicle?.images?.length > 0
      ? vehicle.images
      : [vehicle.imageUrl || FALLBACK_IMG];

  // ================= CHECK SPEC IMAGE =================
  const isSpecImage =
    activeImage?.includes("spec") ||
    activeImage?.includes("thong-so") ||
    activeImage?.includes("specification");

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= LOGIN REQUIRED MODAL ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">

          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

            <div className="bg-blue-900 px-6 py-5 text-white">

              <h2 className="text-2xl font-black uppercase italic">
                Yêu cầu đăng nhập
              </h2>

              <p className="text-sm text-blue-100 mt-1">
                Bạn cần đăng nhập để thực hiện đặt cọc xe.
              </p>

            </div>

            <div className="p-8 text-center">

              <div
                className="
                  w-24 h-24
                  mx-auto
                  rounded-full
                  bg-blue-50
                  flex items-center justify-center
                  mb-6
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase">
                Vui lòng đăng nhập
              </h3>

              <p className="text-gray-500 mt-3 leading-relaxed">
                Đăng nhập tài khoản để tiếp tục
                đặt cọc xe và theo dõi lịch sử
                giao dịch của bạn.
              </p>

              <div className="mt-8 space-y-3">

                <button
                  onClick={() => navigate("/login")}
                  className="
                    w-full
                    bg-blue-900
                    hover:bg-blue-800
                    text-white
                    py-4
                    rounded-2xl
                    font-black
                    uppercase
                    tracking-wider
                    transition-all
                    shadow-xl
                  "
                >
                  Đi tới trang đăng nhập
                </button>

                <button
                  onClick={() =>
                    setShowLoginModal(false)
                  }
                  className="
                    w-full
                    border-2 border-gray-200
                    text-gray-500
                    hover:bg-gray-100
                    py-4
                    rounded-2xl
                    font-black
                    uppercase
                    tracking-wider
                    transition-all
                  "
                >
                  Đóng
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOOKING MODAL ================= */}
      <BookingModal
        car={vehicle}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedVariant={selectedVariant}
        selectedColorName={selectedColor?.name}
      />

      <div className="container mx-auto px-6 py-10">

        {/* ================= TOP ================= */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ================= LEFT - GALLERY ================= */}
          <div>

            <div className="bg-white rounded-2xl shadow overflow-hidden p-4">

              <img
                src={getHDImage(activeImage)}
                alt={vehicle.name}
                onClick={() =>
                  window.open(
                    getHDImage(activeImage),
                    "_blank"
                  )
                }
                onError={(e) => {
                  e.target.src = FALLBACK_IMG;
                }}
                className={`
                  w-full
                  ${
                    isSpecImage
                      ? "h-auto object-contain"
                      : "h-[420px] object-contain"
                  }
                  rounded-xl
                  bg-white
                  cursor-zoom-in
                  transition-all
                `}
              />

            </div>

            {/* ================= THUMBNAILS ================= */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

              {images.map((img, i) => (

                <img
                  key={i}
                  src={getHDImage(img)}
                  alt={`gallery-${i}`}
                  onClick={() =>
                    setActiveImage(img)
                  }
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                  className={`
                    w-24 h-20
                    object-cover
                    rounded-lg
                    cursor-pointer
                    border-2
                    bg-white
                    transition-all
                    ${
                      activeImage === img
                        ? "border-blue-900 scale-105 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }
                  `}
                />

              ))}

            </div>
          </div>

          {/* ================= RIGHT - INFO ================= */}
          <div className="lg:sticky top-24 h-fit">

            {/* NAME */}
            <h1 className="text-3xl font-black uppercase text-slate-900">
              {vehicle.name}
            </h1>

            {/* PRICE */}
            <p className="text-red-600 text-3xl font-black mt-3">

              {selectedVariant?.basePrice
                ? new Intl.NumberFormat(
                    "vi-VN"
                  ).format(
                    selectedVariant.basePrice
                  ) + " ₫"
                : "Liên hệ"}

            </p>

            {/* ================= VARIANTS ================= */}
            <div className="mt-8">

              <p className="font-bold mb-3 text-gray-700 uppercase text-sm tracking-wide">
                Phiên bản
              </p>

              <div className="flex flex-wrap gap-3">

                {vehicle?.variants?.map((v) => (

                  <button
                    key={v._id}
                    onClick={() => {

                      setSelectedVariant(v);

                      const firstColor =
                        v?.colors?.[0] || null;

                      setSelectedColor(firstColor);

                      setActiveImage(
                        firstColor?.images?.[0] ||
                          vehicle.imageUrl ||
                          FALLBACK_IMG
                      );
                    }}
                    className={`
                      px-5 py-3
                      rounded-xl
                      border
                      text-sm
                      font-bold
                      transition-all
                      ${
                        selectedVariant?._id ===
                        v._id
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                          : "bg-white text-slate-700 border-gray-300 hover:border-slate-900"
                      }
                    `}
                  >
                    {v.variantName}
                  </button>

                ))}

              </div>
            </div>

            {/* ================= COLORS ================= */}
            <div className="mt-8">

              <p className="font-bold mb-3 text-gray-700 uppercase text-sm tracking-wide">
                Màu ngoại thất
              </p>

              <div className="flex gap-4 flex-wrap">

                {selectedVariant?.colors?.map((c) => (

                  <div
                    key={c._id}
                    title={c.name}
                    onClick={() => {

                      setSelectedColor(c);

                      setActiveImage(
                        c?.images?.[0] ||
                          vehicle.imageUrl ||
                          FALLBACK_IMG
                      );
                    }}
                    className={`
                      relative
                      w-12 h-12
                      rounded-full
                      cursor-pointer
                      border-4
                      transition-all
                      hover:scale-110
                      ${
                        selectedColor?._id ===
                        c._id
                          ? "border-blue-600 scale-110 shadow-xl"
                          : "border-white shadow-md"
                      }
                    `}
                    style={{
                      backgroundColor:
                        c.hexCode || "#ccc"
                    }}
                  />

                ))}

              </div>

              {/* COLOR NAME */}
              {selectedColor && (
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  Màu đang chọn:
                  <span className="ml-1 font-bold text-slate-800">
                    {selectedColor.name}
                  </span>
                </p>
              )}
            </div>

            {/* ================= CTA ================= */}
            <div className="mt-10 space-y-4">

              <button
                onClick={handleOpenBooking}
                className="
                  w-full
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  py-4
                  rounded-xl
                  font-black
                  text-lg
                  uppercase
                  tracking-wider
                  transition-all
                  shadow-lg
                  shadow-red-100
                "
              >
                Đặt cọc xe 2.000₫
              </button>

              <button
  onClick={() =>
    navigate("/test-drive", {
      state: {
        carName: vehicle.name,
        vehicleId: vehicle._id,
        variantName: selectedVariant?.variantName || "",
      },
    })
  }
  className="
    w-full
    border-2 border-slate-900
    text-slate-900
    hover:bg-slate-900
    hover:text-white
    py-4
    rounded-xl
    font-black
    uppercase
    tracking-wider
    transition-all
  "
>
  Đăng ký lái thử
</button>

            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mt-16">

          {/* TAB HEADER */}
          <div className="flex gap-8 border-b border-gray-200">

            <button
              onClick={() =>
                setActiveTab("info")
              }
              className={`
                pb-4
                text-sm
                font-black
                uppercase
                tracking-widest
                transition-all
                ${
                  activeTab === "info"
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "text-gray-400 hover:text-slate-600"
                }
              `}
            >
              Mô tả chi tiết
            </button>

            <button
              onClick={() =>
                setActiveTab("specs")
              }
              className={`
                pb-4
                text-sm
                font-black
                uppercase
                tracking-widest
                transition-all
                ${
                  activeTab === "specs"
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "text-gray-400 hover:text-slate-600"
                }
              `}
            >
              Thông số kỹ thuật
            </button>

          </div>

          {/* ================= TAB CONTENT ================= */}
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

            {/* ================= DESCRIPTION ================= */}
            {activeTab === "info" && (

              <div
                className="description-content text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    vehicle.description ||
                    "Đang cập nhật mô tả..."
                }}
              />

            )}

            {/* ================= SPECS ================= */}
            {activeTab === "specs" && (

              <div>

                {/* IMAGE SPECS */}
                {vehicle.imageUrl && (
                  <div className="mb-8">

                    <img
                      src={getHDImage(
                        vehicle.imageUrl
                      )}
                      alt="Thông số kỹ thuật"
                      onClick={() =>
                        window.open(
                          getHDImage(
                            vehicle.imageUrl
                          ),
                          "_blank"
                        )
                      }
                      className="
                        w-full
                        h-auto
                        object-contain
                        rounded-xl
                        border
                        shadow-sm
                        cursor-zoom-in
                      "
                    />

                  </div>
                )}

                {/* TEXT SPECS */}
                {vehicle.specs &&
                Object.keys(vehicle.specs)
                  .length > 0 ? (

                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">

                    {Object.entries(
                      vehicle.specs
                    ).map(([key, value]) => (

                      <div
                        key={key}
                        className="
                          flex justify-between
                          border-b border-gray-100
                          py-3 gap-5
                        "
                      >

                        <span className="text-gray-500 font-medium">
                          {key}
                        </span>

                        <span className="text-slate-900 font-semibold text-right">
                          {value}
                        </span>

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="text-gray-400 italic">
                    Thông số đang được cập nhật...
                  </p>

                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= HTML CONTENT CSS ================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .description-content h1 {
              font-size: 1.8rem;
              font-weight: 800;
              margin-bottom: 1rem;
              text-transform: uppercase;
              color: #0f172a;
            }

            .description-content h2 {
              font-size: 1.4rem;
              font-weight: 700;
              margin-top: 1.8rem;
              margin-bottom: 1rem;
              color: #1e293b;
            }

            .description-content h3 {
              font-size: 1.2rem;
              font-weight: 700;
              margin-top: 1.2rem;
              margin-bottom: 0.8rem;
              color: #334155;
            }

            .description-content p {
              margin-bottom: 1rem;
              text-align: justify;
              line-height: 1.8;
            }

            .description-content ul {
              list-style-type: disc;
              margin-left: 1.5rem;
              margin-bottom: 1rem;
            }

            .description-content li {
              margin-bottom: 0.5rem;
              line-height: 1.7;
            }

            .description-content img {
              border-radius: 12px;
              margin: 1rem 0;
            }

            .description-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
            }

            .description-content table td,
            .description-content table th {
              border: 1px solid #ddd;
              padding: 10px;
            }
          `
        }}
      />

    </div>
  );
};

export default VehicleDetail;