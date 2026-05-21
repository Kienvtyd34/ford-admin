const normalize = (
  text = ""
) => {

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
};

// ================= VEHICLE =================

export const semanticVehicleSearch =
(
  message,
  models
) => {

  const msg =
    normalize(message);

  return models.filter(
    (m) => {

      const name =
        normalize(m.name);

      const type =
        normalize(m.type);

      // tên xe
      if (
        msg.includes(name)
      ) return true;

      // SUV
      if (
        msg.includes("suv") &&
        type.includes("suv")
      ) return true;

      // bán tải
      if (
        (
          msg.includes("ban tai") ||
          msg.includes("pickup") ||
          msg.includes("pick-up")
        ) &&
        (
          type.includes("pick") ||
          type.includes("pickup")
        )
      ) return true;

      // 7 chỗ
      if (
        msg.includes("7 cho") &&
        m.seats >= 7
      ) return true;

      // gia đình
      if (
        msg.includes(
          "gia dinh"
        ) &&
        m.seats >= 7
      ) return true;

      // offroad
      if (
        (
          msg.includes(
            "offroad"
          ) ||
          msg.includes("dia hinh")
        ) &&
        (
          name.includes(
            "raptor"
          ) ||
          name.includes(
            "ranger"
          ) ||
          name.includes(
            "everest"
          )
        )
      ) return true;

      return false;
    }
  );
};

// ================= TECHNICAL =================

export const semanticTechnicalSearch =
(
  message,
  issues
) => {

  const msg =
    normalize(message);

  return issues.find(
    (issue) => {

      if (
        msg.includes(
          normalize(
            issue.title
          )
        )
      ) {
        return true;
      }

      return issue.symptoms.some(
        (s) =>
          msg.includes(
            normalize(s)
          )
      );
    }
  );
};