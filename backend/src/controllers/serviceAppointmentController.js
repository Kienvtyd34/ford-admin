import CustomerVehicle from "../models/CustomerVehicle.js";
import ServiceAppointment from "../models/ServiceAppointment.js";
import ServicePackage from "../models/ServicePackage.js";
import ServicePayment from "../models/ServicePayment.js";
import {
  SERVICE_DEPOSIT_AMOUNT,
  SERVICE_HOLD_MINUTES,
  SERVICE_TIME_SLOTS,
  SERVICE_TRANSFER_PREFIX,
} from "../config/service.js";

const ACTIVE_STATUSES = ["Held", "AwaitingPayment", "Confirmed", "InService"];

const parseServiceDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const populateAppointment = (query) =>
  query
    .populate("customerVehicle")
    .populate("servicePackage")
    .populate("user", "fullName phone email")
    .populate("handledBy", "fullName role");

const expireAppointments = async () => {
  await ServiceAppointment.updateMany(
    {
      status: { $in: ["Held", "AwaitingPayment"] },
      holdExpiresAt: { $lte: new Date() },
    },
    { $set: { status: "Expired" } }
  );

  await ServicePayment.updateMany(
    { status: "Pending", createdAt: { $lte: new Date(Date.now() - SERVICE_HOLD_MINUTES * 60 * 1000) } },
    { $set: { status: "Expired" } }
  );
};

export const getAvailableServiceSlots = async (req, res) => {
  try {
    const serviceDate = parseServiceDate(req.query.date);
    if (!serviceDate) {
      return res.status(400).json({ success: false, message: "Ngày không hợp lệ" });
    }

    await expireAppointments();
    const appointments = await ServiceAppointment.find({
      serviceDate,
      status: { $in: ACTIVE_STATUSES },
      holdExpiresAt: { $gt: new Date() },
    }).select("timeSlot");

    const occupied = new Set(appointments.map((appointment) => appointment.timeSlot));
    const data = SERVICE_TIME_SLOTS.map((timeSlot) => ({
      timeSlot,
      available: !occupied.has(timeSlot),
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceAppointment = async (req, res) => {
  try {
    const { customerVehicleId, servicePackageId, date, timeSlot, notes } = req.body;
    const serviceDate = parseServiceDate(date);

    if (!serviceDate || serviceDate < new Date(new Date().setUTCHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Ngày bảo dưỡng không hợp lệ" });
    }

    if (!SERVICE_TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "Khung giờ không hợp lệ" });
    }

    const [customerVehicle, servicePackage] = await Promise.all([
      CustomerVehicle.findOne({ _id: customerVehicleId, user: req.user._id, isActive: true }),
      ServicePackage.findOne({ _id: servicePackageId, isActive: true }),
    ]);

    if (!customerVehicle) {
      return res.status(404).json({ success: false, message: "Không tìm thấy xe của bạn" });
    }
    if (!servicePackage) {
      return res.status(404).json({ success: false, message: "Không tìm thấy gói dịch vụ đang hoạt động" });
    }

    await expireAppointments();
    const holdExpiresAt = new Date(Date.now() + SERVICE_HOLD_MINUTES * 60 * 1000);
    const appointment = await ServiceAppointment.create({
      user: req.user._id,
      customerVehicle: customerVehicle._id,
      servicePackage: servicePackage._id,
      serviceDate,
      timeSlot,
      status: "AwaitingPayment",
      holdExpiresAt,
      notes,
    });

    const transferCode = `${SERVICE_TRANSFER_PREFIX}_${appointment._id.toString().slice(-10).toUpperCase()}`;
    let payment;
    try {
      payment = await ServicePayment.create({
        appointment: appointment._id,
        user: req.user._id,
        amount: SERVICE_DEPOSIT_AMOUNT,
        transferCode,
      });
    } catch (error) {
      await ServiceAppointment.findByIdAndUpdate(appointment._id, { status: "Expired" });
      throw error;
    }

    const populated = await populateAppointment(
      ServiceAppointment.findById(appointment._id)
    );

    res.status(201).json({
      success: true,
      data: {
        appointment: populated,
        payment,
        depositAmount: SERVICE_DEPOSIT_AMOUNT,
        transferCode,
        holdExpiresAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Khung giờ vừa được khách khác giữ" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyServiceAppointments = async (req, res) => {
  try {
    await expireAppointments();
    const appointments = await populateAppointment(
      ServiceAppointment.find({ user: req.user._id }).sort({ serviceDate: -1, createdAt: -1 })
    );
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyServiceAppointmentById = async (req, res) => {
  try {
    await expireAppointments();
    const appointment = await populateAppointment(
      ServiceAppointment.findOne({ _id: req.params.id, user: req.user._id })
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch bảo dưỡng" });
    }

    const payment = await ServicePayment.findOne({ appointment: appointment._id });
    res.json({ success: true, data: { appointment, payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMyServiceAppointment = async (req, res) => {
  try {
    const appointment = await ServiceAppointment.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ["Held", "AwaitingPayment", "Confirmed"] },
      },
      { status: "Cancelled", cancelledAt: new Date() },
      { new: true }
    );

    if (!appointment) {
      return res.status(409).json({ success: false, message: "Lịch không thể hủy ở trạng thái hiện tại" });
    }

    await ServicePayment.updateOne(
      { appointment: appointment._id, status: "Pending" },
      { $set: { status: "Failed" } }
    );
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllServiceAppointments = async (req, res) => {
  try {
    await expireAppointments();
    const appointments = await populateAppointment(
      ServiceAppointment.find().sort({ serviceDate: 1, timeSlot: 1, createdAt: -1 })
    );
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Confirmed", "InService", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const update = { status, handledBy: req.user._id };
    if (status === "Confirmed") update.confirmedAt = new Date();
    if (status === "Completed") update.completedAt = new Date();
    if (status === "Cancelled") update.cancelledAt = new Date();

    const appointment = await ServiceAppointment.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch bảo dưỡng" });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export { expireAppointments };
