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
              className="w-full h-[420px] object-contain bg-white rounded-xl shadow"
              onError={(e) => (e.target.src = FALLBACK_IMG)}
            />

            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 object-cover rounded cursor-pointer border ${
                    activeImage === img ? "border-black" : "border-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky top-24 h-fit">

            <h1 className="text-3xl font-bold uppercase">
              {vehicle.name}
            </h1>

            <p className="text-red-600 text-2xl font-bold mt-2">
              {selectedVariant?.basePrice
                ? new Intl.NumberFormat("vi-VN").format(
                    selectedVariant.basePrice
                  ) + " ₫"
                : "Liên hệ"}
            </p>

            {/* VARIANT */}
            <div className="mt-6">
              <p className="font-semibold mb-2">Phiên bản</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => {
                      setSelectedVariant(v);

                      const c = v.colors?.[0];
                      setSelectedColor(c);

                      setActiveImage(
                        c?.images?.[0] ||
                          vehicle.imageUrl ||
                          FALLBACK_IMG
                      );
                    }}
                    className={`px-4 py-2 rounded-full border ${
                      selectedVariant?._id === v._id
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {v.variantName}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR */}
            <div className="mt-6">
              <p className="font-semibold mb-2">Màu xe</p>
              <div className="flex gap-3">
                {selectedVariant?.colors?.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedColor(c);
                      setActiveImage(
                        c.images?.[0] ||
                          vehicle.imageUrl ||
                          FALLBACK_IMG
                      );
                    }}
                    className={`w-10 h-10 rounded-full cursor-pointer border-4 ${
                      selectedColor?._id === c._id
                        ? "border-black scale-110"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c.hexCode || "#ccc" }}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 space-y-3">
              <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-lg">
                Đặt cọc xe
              </button>

              <button className="w-full border py-3 rounded-xl font-semibold">
                Đăng ký lái thử
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-16">
          <div className="flex gap-6 border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-2 ${activeTab === "info" && "border-b-2 border-black"}`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 ${activeTab === "specs" && "border-b-2 border-black"}`}
            >
              Thông số
            </button>
          </div>

          <div className="mt-6 bg-white p-6 rounded-xl shadow">
            {activeTab === "info" && (
              <p className="text-gray-600">
                {vehicle.description || "Chưa có mô tả"}
              </p>
            )}

            {activeTab === "specs" && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {vehicle.specs
                  ? Object.entries(vehicle.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b py-2">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))
                  : "Chưa có thông số"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;