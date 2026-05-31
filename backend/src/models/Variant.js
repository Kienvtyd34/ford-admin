import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleModel",
      required: true,
    },

    variantName: {
      type: String,
      required: true,
    },

    aliases: [String],

    basePrice: {
      type: Number,
      required: true,
    },

    transmission: String,

    driveTrain: String,

    fuelType: String,

    // ================= SPECS =================

    specs: {
      engine: String,

      horsepower: Number,

      torque: Number,

      fuelConsumption: String,

      seats: Number,

      wheelSize: Number,

      fuelTank: Number,

      groundClearance: Number,

      wheelbase: Number,

      length: Number,

      width: Number,

      height: Number,
    },

    // ================= FEATURES =================

    features: {
      // Hiệu năng
      turbo: Boolean,

      // An toàn
      abs: Boolean,

      adas: Boolean,

      adaptiveCruise: Boolean,

      blindSpot: Boolean,

      laneKeepAssist: Boolean,

      autoEmergencyBrake: Boolean,

      rearCrossTrafficAlert: Boolean,

      trafficSignRecognition: Boolean,

      // Camera
      camera360: Boolean,

      reverseCamera: Boolean,

      parkingSensorFront: Boolean,

      parkingSensorRear: Boolean,

      // Tiện nghi
      sunroof: Boolean,

      wirelessCharging: Boolean,

      powerTailgate: Boolean,

      autoHeadlamp: Boolean,

      autoWiper: Boolean,

      ambientLight: Boolean,

      // Nội thất
      leatherSeat: Boolean,

      ventilatedSeat: Boolean,

      heatedSeat: Boolean,

      powerDriverSeat: Boolean,

      powerPassengerSeat: Boolean,

      // Giải trí
      appleCarplay: Boolean,

      androidAuto: Boolean,

      sync4: Boolean,

      fordPass: Boolean,

      premiumAudio: Boolean,

      // Transit
      powerSlidingDoor: Boolean,

      powerRunningBoard: Boolean,

      luggageRack: Boolean,

      foldableLastRow: Boolean,
    },

    isHot: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Variant",
  variantSchema,
  "variants"
);