if (intent === "recommend") {
  let variants = await Variant.find()
    .populate("modelId")
    .lean();

  // ======================
  // SAFE FILTER
  // ======================
  variants = variants.filter(v => v?.modelId);

  const msg = (message || "").toLowerCase();

  // ======================
  // 7 SEATS / FAMILY
  // ======================
  if (msg.includes("7 chỗ") || msg.includes("gia đình")) {
    variants = variants.filter(v =>
      v.modelId.seats >= 7
    );
  }

  // ======================
  // SUV
  // ======================
  if (msg.includes("suv")) {
    variants = variants.filter(v =>
      v.modelId.type === "SUV"
    );
  }

  // ======================
  // VAN
  // ======================
  if (msg.includes("16 chỗ") || msg.includes("xe du lịch")) {
    variants = variants.filter(v =>
      v.modelId.type === "Van"
    );
  }

  // ======================
  // PICKUP
  // ======================
  if (msg.includes("bán tải")) {
    variants = variants.filter(v =>
      v.modelId.name.includes("Ranger") ||
      v.modelId.name.includes("Raptor")
    );
  }

  // ======================
  // SORT SMART (CHATGPT STYLE)
  // ======================
  variants.sort((a, b) => {
    // ưu tiên xe hot
    const hotA = a.modelId.isHot ? 1 : 0;
    const hotB = b.modelId.isHot ? 1 : 0;

    return hotB - hotA;
  });

  const top = variants.slice(0, 5);

  return {
    message:
      "🚗 Gợi ý xe phù hợp:\n\n" +
      top.map(v => {
        const name = v.modelId.name;
        const seats = v.modelId.seats;
        const price = Number(v.basePrice || 0).toLocaleString();

        return `• ${name} (${seats} chỗ) - ${price} VNĐ`;
      }).join("\n")
  };
}