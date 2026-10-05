import crypto from "crypto";
import ServiceAppointment from "../models/ServiceAppointment.js";
import ServicePayment from "../models/ServicePayment.js";
import { SERVICE_TRANSFER_PREFIX } from "../config/service.js";

const getWebhookSecret = () => process.env.SEPAY_WEBHOOK_SECRET;

export const verifyServiceWebhook = (req) => {
  const secret = getWebhookSecret();
  if (!secret) return process.env.NODE_ENV !== "production";

  const provided = req.headers["x-sepay-secret"] || req.headers["authorization"];
  const token = String(provided || "").replace(/^(?:Bearer|Apikey)\s+/i, "").trim();
  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);
  return tokenBuffer.length === secretBuffer.length && crypto.timingSafeEqual(tokenBuffer, secretBuffer);
};

export const parseServiceTransferCode = (content) => {
  if (typeof content !== "string") return null;
  const match = content.match(new RegExp(`${SERVICE_TRANSFER_PREFIX}[_\\s-]?([a-z0-9]{6,24})`, "i"));
  return match ? `${SERVICE_TRANSFER_PREFIX}${match[1].toUpperCase()}` : null;
};

export const processServicePaymentWebhook = async (payload) => {
  const transferCode = parseServiceTransferCode(payload.content);
  if (!transferCode) return { handled: false, message: "Không phải giao dịch dịch vụ" };

  const transactionId = payload.id ?? payload.transactionId;
  const amount = Number(payload.transferAmount ?? payload.amount ?? payload.creditAmount);
  if (!transactionId || !Number.isFinite(amount)) {
    return { handled: true, paid: false, message: "Webhook thiếu mã giao dịch hoặc số tiền" };
  }

  const legacyTransferCode = `${SERVICE_TRANSFER_PREFIX}_${transferCode.slice(SERVICE_TRANSFER_PREFIX.length)}`;
  const payment = await ServicePayment.findOne({ transferCode: { $in: [transferCode, legacyTransferCode] } });
  if (!payment) return { handled: true, paid: false, message: "Không tìm thấy khoản thanh toán" };
  if (payment.status === "Paid" && payment.sepayTransactionId === String(transactionId)) {
    return { handled: true, paid: true, duplicate: true, message: "Đã xử lý trước đó" };
  }
  if (payment.status !== "Pending") {
    return { handled: true, paid: false, message: "Khoản thanh toán không còn chờ xử lý" };
  }
  if (amount !== payment.amount) {
    return { handled: true, paid: false, message: "Số tiền thanh toán không khớp" };
  }

  const appointment = await ServiceAppointment.findOne({
    _id: payment.appointment,
    status: "AwaitingPayment",
    holdExpiresAt: { $gt: new Date() },
  });
  if (!appointment) {
    return { handled: true, paid: false, message: "Lịch đã hết hạn hoặc không còn hợp lệ" };
  }

  let updatedPayment;
  try {
    updatedPayment = await ServicePayment.findOneAndUpdate(
      { _id: payment._id, status: "Pending", sepayTransactionId: { $exists: false } },
      {
        status: "Paid",
        sepayTransactionId: String(transactionId),
        providerPayload: payload,
        paidAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      return { handled: true, paid: true, duplicate: true, message: "Đã xử lý đồng thời" };
    }
    throw error;
  }

  if (!updatedPayment) {
    return { handled: true, paid: true, duplicate: true, message: "Đã xử lý đồng thời" };
  }

  await ServiceAppointment.updateOne(
    { _id: appointment._id, status: "AwaitingPayment" },
    { $set: { status: "Confirmed", confirmedAt: new Date() } }
  );

  return { handled: true, paid: true, message: "OK" };
};
