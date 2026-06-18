import Intent from "../models/Intent.js";

// =========================
// GET ALL INTENTS
// =========================
export const getIntents = async (req, res) => {
  try {
    const intents = await Intent.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: intents
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// GET ONE INTENT
// =========================
export const getIntentById = async (req, res) => {
  try {
    const { id } = req.params;

    const intent = await Intent.findById(id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found"
      });
    }

    return res.json({
      success: true,
      data: intent
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// CREATE INTENT
// =========================
export const createIntent = async (req, res) => {
  try {
    let { name, label, keywords, weight, priorityBoost, active } = req.body;

    const exists = await Intent.findOne({ name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Intent already exists"
      });
    }

    const intent = await Intent.create({
      name,
      label,
      keywords: keywords || [],
      weight: weight ?? 1,
      priorityBoost: priorityBoost ?? 0,
      active: active ?? true
    });

    return res.json({
      success: true,
      data: intent
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// UPDATE INTENT
// =========================
export const updateIntent = async (req, res) => {
  try {
    const { id } = req.params;

    const intent = await Intent.findById(id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found"
      });
    }

    // update fields
    const allowedFields = [
      "name",
      "label",
      "keywords",
      "weight",
      "priorityBoost",
      "active"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        intent[field] = req.body[field];
      }
    });

    await intent.save();

    return res.json({
      success: true,
      data: intent
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// DELETE INTENT
// =========================
export const deleteIntent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Intent.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Intent not found"
      });
    }

    return res.json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// TOGGLE ACTIVE STATUS
// =========================
export const toggleIntentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const intent = await Intent.findById(id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Intent not found"
      });
    }

    intent.active = !intent.active;
    await intent.save();

    return res.json({
      success: true,
      data: intent
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};