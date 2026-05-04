export const colorsMap = {
  // Màu cơ bản
  "Trắng": "#FFFFFF",
  "Bạc": "#C0C0C0",
  "Đỏ": "#FF0000",
  "Đen": "#000000",
  "Xám": "#808080",
  "Xanh": "#0000FF",
  "Vàng": "#FFFF00",

  // Màu Ford đặc trưng
  "Trắng Kim Cương": "#F0F8FF",
  "Trắng Tuyết": "#FFFAFA",
  "Đỏ Ruby": "#9B111E",
  "Đỏ Race": "#CC0000",
  "Xanh Dương": "#0047AB",
  "Xanh Grabber": "#00BFFF",
  "Vàng Cam": "#FF8C00",
  "Ghi Bạc": "#A9A9A9",
  "Xám Meteor": "#4F4F4F",
  "Đen Meteor": "#1A1A1A",
  "Nâu Equinox": "#4B3621",
  
  // Bổ sung cho Raptor & Everest mới
  "Cam Code Orange": "#FF4500",
  "Xám Stealth": "#36454F",
  "Xanh Lightning": "#003399",
  "Ghi Vàng": "#D4AF37"
};

/**
 * Lấy mã Hex từ tên màu. 
 * Hỗ trợ tìm kiếm tương đối (ví dụ: "Trắng" sẽ khớp với "Trắng Tuyết" nếu không tìm thấy chính xác)
 */
export const getHexColor = (colorName) => {
  if (!colorName) return "#CCCCCC";
  
  // 1. Tìm chính xác
  if (colorsMap[colorName]) return colorsMap[colorName];

  // 2. Tìm kiếm tương đối (nếu trong tên có chữ "Đỏ" thì lấy màu Đỏ chung)
  const baseColors = Object.keys(colorsMap);
  const match = baseColors.find(base => colorName.includes(base));
  
  return match ? colorsMap[match] : "#CCCCCC";
};