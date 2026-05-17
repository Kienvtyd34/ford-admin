import {
  diagnoseProblem
} from "../../ai/diagnosisEngine.js";

export const diagnose =
async (req, res) => {

  try {

    const { message } = req.body;

    const result =
      await diagnoseProblem(
        message
      );

    if (!result) {

      return res.json({
        success: false,
        message:
          "Không xác định được lỗi"
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};