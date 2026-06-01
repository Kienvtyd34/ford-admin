export const normalize = (text = "") => {

  return text
    .toString()
    .toLowerCase()

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .replace(/[đ]/g, "d")

    .replace(/[^a-z0-9\s]/g, " ")

    .replace(/\s+/g, " ")

    .trim();
};

export default normalize;