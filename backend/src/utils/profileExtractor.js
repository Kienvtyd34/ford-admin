export function extractCustomerProfile(
    message,
    currentProfile = {}
) {

    const text = message.toLowerCase();

    const profile = {
        ...currentProfile
    };

    // =====================
    // USAGE
    // =====================

    if (
        text.includes("gia đình") ||
        text.includes("vo chong") ||
        text.includes("con nhỏ")
    ) {
        profile.usage = "family";
    }

    if (
        text.includes("công việc") ||
        text.includes("kinh doanh")
    ) {
        profile.usage = "business";
    }

    if (
        text.includes("vận tải") ||
        text.includes("16 chỗ") ||
        text.includes("18 chỗ") ||
        text.includes("chạy dịch vụ")
    ) {
        profile.usage = "transport";
    }

    // =====================
    // SỐ CHỖ
    // =====================

    const seatMatch =
        text.match(/(\d+)\s*chỗ/);

    if (seatMatch) {

        profile.seats =
            parseInt(seatMatch[1]);
    }

    // =====================
    // NGÂN SÁCH
    // =====================

    const tyMatch =
        text.match(/(\d+(\.\d+)?)\s*tỷ/);

    if (tyMatch) {

        profile.budget =
            Number(tyMatch[1]) *
            1000000000;
    }

    const trieuMatch =
        text.match(/(\d+)\s*triệu/);

    if (
        trieuMatch &&
        !profile.budget
    ) {

        profile.budget =
            Number(trieuMatch[1]) *
            1000000;
    }

    // =====================
    // ĐỊA HÌNH
    // =====================

    if (
        text.includes("đi phố") ||
        text.includes("đô thị")
    ) {

        profile.drivingArea =
            "city";
    }

    if (
        text.includes("đường trường") ||
        text.includes("cao tốc") ||
        text.includes("đi xa")
    ) {

        profile.drivingArea =
            "highway";
    }

    if (
        text.includes("offroad") ||
        text.includes("địa hình") ||
        text.includes("đèo núi")
    ) {

        profile.drivingArea =
            "offroad";

        profile.wantsOffroad =
            true;
    }

    // =====================
    // ADAS
    // =====================

    if (
        text.includes("an toàn") ||
        text.includes("adas")
    ) {

        profile.wantsADAS =
            true;
    }

    // =====================
    // SANG TRỌNG
    // =====================

    if (
        text.includes("cao cấp") ||
        text.includes("sang trọng") ||
        text.includes("nội thất đẹp")
    ) {

        profile.wantsLuxury =
            true;
    }

    // =====================
    // CHỞ HÀNG
    // =====================

    if (
        text.includes("chở hàng") ||
        text.includes("bán tải")
    ) {

        profile.cargoNeed =
            true;
    }

    // =====================
    // XE ĐIỆN
    // =====================

    if (
        text.includes("xe điện") ||
        text.includes("electric")
    ) {

        profile.ecoFriendly =
            true;

        profile.fuelPreference =
            "electric";
    }

    // =====================
    // DU LỊCH
    // =====================

    if (
        text.includes("du lịch") ||
        text.includes("đi xa thường xuyên")
    ) {

        profile.frequentTravel =
            true;
    }

    if (
    /(co|can|uu tien adas)/i.test(message)
) {
    profile.wantsADAS = true;
}

if (
    /(khong can adas|khong uu tien adas)/i.test(message)
) {
    profile.wantsADAS = false;
}

    return profile;
}