import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const FALLBACK_IMG = "https://via.placeholder.com/500x300?text=No+Image";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(FALLBACK_IMG);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/vehicles/detail/${id}`);
        const data = res.data.data;

        setVehicle(data);

        const v = data.variants?.[0];
        const c = v?.colors?.[0];

        setSelectedVariant(v);
        setSelectedColor(c);

        setActiveImage(c?.images?.[0] || data.imageUrl || FALLBACK_IMG);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!vehicle) return <div className="text-center py-20">Loading...</div>;

  const images =
    selectedColor?.images?.length > 0
      ? selectedColor.images
      : [vehicle.imageUrl || FALLBACK_IMG];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT - GALLERY */}
          <div>
            <img
              src={activeImage}
              alt={vehicle.name}
              className="w-full h-[420px] object-contain bg-white rounded-xl shadow"
              onError={(e) => (e.target.src = FALLBACK_IMG)}
            />

            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`gallery-${i}`}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                    activeImage === img ? "border-blue-900" : "border-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div className="lg:sticky top-24 h-fit">
            <h1 className="text-3xl font-bold uppercase text-slate-900">
              {vehicle.name}
            </h1>

            <p className="text-red-600 text-2xl font-black mt-2">
              {selectedVariant?.basePrice
                ? new Intl.NumberFormat("vi-VN").format(selectedVariant.basePrice) + " ₫"
                : "Liên hệ"}
            </p>

            {/* VARIANT SELECTION */}
            <div className="mt-6">
              <p className="font-semibold mb-2 text-gray-700">Phiên bản</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => {
                      setSelectedVariant(v);
                      const c = v.colors?.[0];
                      setSelectedColor(c);
                      setActiveImage(c?.images?.[0] || vehicle.imageUrl || FALLBACK_IMG);
                    }}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                      selectedVariant?._id === v._id
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white text-slate-700 border-gray-300 hover:border-slate-900"
                    }`}
                  >
                    {v.variantName}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SELECTION */}
            <div className="mt-6">
              <p className="font-semibold mb-2 text-gray-700">Màu ngoại thất</p>
              <div className="flex gap-3">
                {selectedVariant?.colors?.map((c) => (
                  <div
                    key={c._id}
                    title={c.colorName}
                    onClick={() => {
                      setSelectedColor(c);
                      setActiveImage(c.images?.[0] || vehicle.imageUrl || FALLBACK_IMG);
                    }}
                    className={`w-10 h-10 rounded-full cursor-pointer border-4 transition-transform hover:scale-110 ${
                      selectedColor?._id === c._id
                        ? "border-blue-500 scale-110 shadow-lg"
                        : "border-white shadow-sm"
                    }`}
                    style={{ backgroundColor: c.hexCode || "#ccc" }}
                  />
                ))}
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="mt-10 space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-colors shadow-lg shadow-red-100">
                Nhận báo giá lăn bánh
              </button>

              <button className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white py-4 rounded-lg font-bold uppercase tracking-wider transition-all">
                Đăng ký lái thử
              </button>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="mt-16">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "info" 
                ? "border-b-2 border-slate-900 text-slate-900" 
                : "text-gray-400 hover:text-slate-600"
              }`}
            >
              Mô tả chi tiết
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "specs" 
                ? "border-b-2 border-slate-900 text-slate-900" 
                : "text-gray-400 hover:text-slate-600"
              }`}
            >
              Thông số kỹ thuật
            </button>
          </div>

          <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {activeTab === "info" && (
              <div 
                className="description-content text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: vehicle.description || "Đang cập nhật mô tả..." }}
              />
            )}

            {activeTab === "specs" && (
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
                {vehicle.specs && Object.keys(vehicle.specs).length > 0
                  ? Object.entries(vehicle.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-gray-50 py-3">
                        <span className="text-gray-500 font-medium">{key}</span>
                        <span className="text-slate-900 font-semibold text-right">{value}</span>
                      </div>
                    ))
                  : <p className="text-gray-400 italic">Thông số đang được cập nhật...</p>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thêm CSS cho nội dung HTML render ra */}
      <style dangerouslySetInnerHTML={{ __html: `
        .description-content h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; }
        .description-content h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; }
        .description-content p { margin-bottom: 1rem; text-align: justify; }
        .description-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .description-content li { margin-bottom: 0.5rem; }
      `}} />
    </div>
  );
};

export default VehicleDetail;