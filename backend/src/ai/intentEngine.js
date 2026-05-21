export const detectIntent = (
  message = ""
) => {

  const msg =
    message.toLowerCase();

  // ================= COMPARE =================

  if (
    msg.includes("vs") ||
    msg.includes("so sánh")
  ) {
    return "COMPARE";
  }

  // ================= TEST DRIVE =================

  if (
    msg.includes("lái thử") ||
    msg.includes("test drive")
  ) {
    return "TEST_DRIVE";
  }

  // ================= TECHNICAL =================

  const technicalKeywords = [

    // lỗi
    "lỗi",
    "abs",
    "check engine",
    "đèn báo",

    // triệu chứng
    "không mát",
    "điều hoà",
    "máy nóng",
    "hao xăng",
    "rung",
    "ồn",
    "kêu",
    "phanh",
    "khó nổ",
    "chảy dầu",
    "rò dầu",
    "xe yếu",
    "không nổ",
    "mất lái",
    "vô lăng nặng",
    "động cơ",
    "hộp số",
    "máy lạnh",
    "đạp ga",
    "không lạnh",
    "xe giật",
  ];

  const isTechnical =
    technicalKeywords.some((k) =>
      msg.includes(k)
    );

  if (isTechnical) {
    return "TECHNICAL";
  }

  // ================= RECOMMEND =================

  const recommendKeywords = [

    "suv",
    "7 chỗ",
    "5 chỗ",
    "gia đình",
    "offroad",
    "tiết kiệm",
    "bán tải",
    "gợi ý",
    "nên mua",
    "xe nào",
  ];

  const isRecommend =
    recommendKeywords.some((k) =>
      msg.includes(k)
    );

  if (isRecommend) {
    return "RECOMMEND";
  }

  // ================= PRICE =================

  if (
    msg.includes("giá")
  ) {
    return "PRICE";
  }

  return "GENERAL";
};