import React from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG =
  'https://dummyimage.com/600x400/e5e7eb/6b7280&text=No+Image';

const VehicleCard = ({ vehicle }) => {

  // ================= GET VEHICLE IMAGE =================
  const getVehicleImage = () => {
    return (
      vehicle?.images?.[0] ||
      FALLBACK_IMG
    );
  };

  // ================= FORMAT PRICE =================
  const formatPrice = (price) => {
    if (!price || isNaN(price) || price <= 0) {
      return 'Liên hệ';
    }

    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }
    ).format(price);
  };

  // ================= STARTING PRICE =================
  const getStartingPrice = () => {

    if (
      !vehicle?.variants ||
      vehicle.variants.length === 0
    ) {
      return 'Liên hệ';
    }

    const prices = vehicle.variants
      .map((v) => v.basePrice)
      .filter(
        (p) =>
          p != null &&
          !isNaN(p) &&
          p > 0
      );

    if (prices.length === 0) {
      return 'Liên hệ';
    }

    const minPrice = Math.min(...prices);

    return formatPrice(minPrice);
  };

  return (
    <Link
      to={`/vehicle/${vehicle._id}`}
      className="
        bg-white
        rounded-2xl
        shadow-sm
        hover:shadow-2xl
        transition-all
        duration-500
        border
        border-gray-100
        flex
        flex-col
        h-full
        group
        cursor-pointer
        overflow-hidden
      "
    >

      {/* ================= IMAGE ================= */}
      <div className="
        h-64
        w-full
        p-4
        flex
        items-center
        justify-center
        relative
        overflow-hidden
        bg-white
      ">

        {/* SHADOW */}
        <div className="
          absolute
          bottom-8
          w-4/5
          h-2
          bg-black
          opacity-[0.03]
          blur-xl
          rounded-[100%]
          group-hover:opacity-10
          transition-all
          duration-700
        " />

        <img
          src={getVehicleImage()}
          alt={vehicle?.name}
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
          className="
            max-w-[90%]
            max-h-[90%]
            object-contain
            z-10
            transform
            group-hover:scale-110
            transition-all
            duration-700
          "
        />

        {/* TYPE */}
        <div className="absolute top-6 right-6 z-20">

          <span className="
            bg-red-600
            text-white
            text-[10px]
            font-bold
            px-3
            py-1
            rounded-full
            uppercase
            tracking-wider
          ">
            {vehicle?.type}
          </span>

        </div>

      </div>

      {/* ================= INFO ================= */}
      <div className="
        px-6
        pb-8
        flex
        flex-col
        flex-grow
        text-center
      ">

        {/* NAME */}
        <h3 className="
          text-lg
          font-bold
          text-slate-900
          uppercase
          mb-2
          group-hover:text-blue-700
          transition-colors
          leading-tight
        ">
          {vehicle?.name}
        </h3>

        {/* ENGINE */}
        <p className="
          text-slate-400
          text-[11px]
          mb-1
          font-medium
          uppercase
          tracking-widest
        ">
          Advanced Ford Engine
        </p>

        {/* PRICE LABEL */}
        <div className="
          text-slate-400
          text-[10px]
          uppercase
          font-bold
          mb-1
        ">
          Giá từ
        </div>

        {/* PRICE */}
        <div className="
          text-red-600
          text-xl
          font-black
          italic
        ">
          {getStartingPrice()}
        </div>

        {/* BUTTON */}
        <div className="
          mt-6
          flex
          justify-center
        ">

          <span className="
            text-[10px]
            text-blue-800
            font-black
            uppercase
            tracking-[0.3em]
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-500
            border-b-2
            border-blue-800
            pb-1
          ">
            Xem chi tiết
          </span>

        </div>

      </div>
    </Link>
  );
};

export default VehicleCard;