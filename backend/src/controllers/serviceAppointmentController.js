import CustomerVehicle from "../models/CustomerVehicle.js";
import ServiceAppointment from "../models/ServiceAppointment.js";
import ServicePackage from "../models/ServicePackage.js";
import ServicePayment from "../models/ServicePayment.js";
import {
  SERVICE_DEPOSIT_AMOUNT,
  SERVICE_HOLD_MINUTES,
  SERVICE_SLOT_CAPACITY,
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
    .populate("servicePackages")
    .populate("user", "fullName phone email")
    .populate("handledBy", "fullName role");

const reserveServiceAppointment = async (appointmentData) => {
  for (let attempt = 0; attempt < SERVICE_SLOT_CAPACITY * 3; attempt += 1) {
    const activeAppointments = await ServiceAppointment.find({
      serviceDate: appointmentData.serviceDate,
      timeSlot: appointmentData.timeSlot,
      status: { $in: ACTIVE_STATUSES },
    }).select("slotNumber").lean();

    if (activeAppointments.length >= SERVICE_SLOT_CAPACITY) return null;

    const occupiedSlots = new Set(
      activeAppointments
        .map((appointment) => appointment.slotNumber)
        .filter((slotNumber) => Number.isInteger(slotNumber) && slotNumber >= 0 && slotNumber < SERVICE_SLOT_CAPACITY)
    );
    let legacyAppointments = activeAppointments.filter(
      (appointment) => !Number.isInteger(appointment.slotNumber)
    ).length;
    for (let slotNumber = 0; legacyAppointments > 0 && slotNumber < SERVICE_SLOT_CAPACITY; slotNumber += 1) {
      if (!occupiedSlots.has(slotNumber)) {
        occupiedSlots.add(slotNumber);
        legacyAppointments -= 1;
      }
    }

    const slotNumber = Array.from({ length: SERVICE_SLOT_CAPACITY }, (_, index) => index)
      .find((candidate) => !occupiedSlots.has(candidate));
    if (slotNumber === undefined) return null;

    try {
      return await ServiceAppointment.create({ ...appointmentData, slotNumber });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  return null;
};

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
    }).select("timeSlot");

    const bookingCounts = appointments.reduce((counts, appointment) => {
      counts.set(appointment.timeSlot, (counts.get(appointment.timeSlot) || 0) + 1);
      return counts;
    }, new Map());
    const data = SERVICE_TIME_SLOTS.map((timeSlot) => ({
      timeSlot,
      bookingCount: bookingCounts.get(timeSlot) || 0,
      remainingCount: Math.max(SERVICE_SLOT_CAPACITY - (bookingCounts.get(timeSlot) || 0), 0),
      capacity: SERVICE_SLOT_CAPACITY,
      available: (bookingCounts.get(timeSlot) || 0) < SERVICE_SLOT_CAPACITY,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceAppointment = async (req, res) => {
  try {
    const { customerVehicleId, servicePackageId, servicePackageIds, date, timeSlot, notes } = req.body;
    const normalizedPackageIds = Array.isArray(servicePackageIds)
      ? servicePackageIds
      : servicePackageId
        ? [servicePackageId]
        : [];
    const uniquePackageIds = [...new Set(normalizedPackageIds.filter(Boolean))];
    const serviceDate = parseServiceDate(date);

    if (!serviceDate || serviceDate < new Date(new Date().setUTCHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Ngày bảo dưỡng không hợp lệ" });
    }

    if (!SERVICE_TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "Khung giờ không hợp lệ" });
    }

    if (uniquePackageIds.length === 0) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ít nhất một gói dịch vụ" });
    }

    const [customerVehicle, selectedPackages] = await Promise.all([
      CustomerVehicle.findOne({ _id: customerVehicleId, user: req.user._id, isActive: true }),
      ServicePackage.find({ _id: { $in: uniquePackageIds }, isActive: true }).sort({ displayOrder: 1 }),
    ]);

    if (!customerVehicle) {
      return res.status(404).json({ success: false, message: "Không tìm thấy xe của bạn" });
    }
    if (selectedPackages.length !== uniquePackageIds.length) {
      return res.status(404).json({ success: false, message: "Một hoặc nhiều gói dịch vụ không hợp lệ" });
    }

    await expireAppointments();
    const holdExpiresAt = new Date(Date.now() + SERVICE_HOLD_MINUTES * 60 * 1000);
    const primaryPackageId = selectedPackages[0]._id;
    const appointment = await reserveServiceAppointment({
      user: req.user._id,
      customerVehicle: customerVehicle._id,
      servicePackage: primaryPackageId,
      servicePackages: selectedPackages.map((pkg) => pkg._id),
      serviceDate,
      timeSlot,
      status: "AwaitingPayment",
      holdExpiresAt,
      notes,
    });
    if (!appointment) {
      return res.status(409).json({
        success: false,
        code: "SERVICE_SLOT_FULL",
        message: `Khung giờ này đã đủ ${SERVICE_SLOT_CAPACITY} lịch. Vui lòng chọn khung giờ khác.`,
      });
    }

    const transferCode = `${SERVICE_TRANSFER_PREFIX}${appointment._id.toString().slice(-10).toUpperCase()}`;
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
        selectedPackages,
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

    if (status === "Confirmed") {
      const paidPayment = await ServicePayment.findOne({ appointment: req.params.id, status: "Paid" });
      if (!paidPayment) {
        return res.status(409).json({ success: false, message: "Chỉ xác nhận lịch sau khi SePay ghi nhận thanh toán" });
      }
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
