export function shouldResetProfile(message) {

    const text = message.toLowerCase();

    return (
        text.includes("doi xe") ||
        text.includes("xe khac") ||
        text.includes("toi muon mua xe") ||
        text.includes("toi muon mua xe ban tai") ||
        text.includes("mua ban tai") ||
        text.includes("ranger") ||
        text.includes("everest") ||
        text.includes("territory")
    );
}

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
    text.includes("gia dinh") ||
    text.includes("vo chong") ||
    text.includes("con nho")
) {
    profile.usage = "family";
}

if (
    text.includes("cong viec") ||
    text.includes("kinh doanh")
) {
    profile.usage = "business";
}

if (
    text.includes("van tai") ||
    text.includes("16 cho") ||
    text.includes("18 cho") ||
    text.includes("chay dich vu")
) {
    profile.usage = "transport";
}

if (
    text.includes("du lich") ||
    text.includes("dich vu") ||
    text.includes("dich vu") ||
    text.includes("chay tour") ||
    text.includes("dua don")
) {
    profile.usage = "transport";
}
    // =====================
    // SỐ CHỖ
    // =====================

    const seatMatch =
    text.match(/(\d+)\s*(chỗ|nguoi|người)?/i);

if (seatMatch) {

    const seats =
        parseInt(seatMatch[1]);

    if (
        seats >= 2 &&
        seats <= 50
    ) {
        profile.seats = seats;
    }
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
        text.includes("di pho") ||
        text.includes("do thi")
    ) {

        profile.drivingArea =
            "city";
    }

    if (
        text.includes("duong truong") ||
        text.includes("cao toc") ||
        text.includes("di xa")||
        text.includes("duong dai")
    ) {

        profile.drivingArea =
            "highway";
    }

    if (
        text.includes("offroad") ||
        text.includes("dia hinh") ||
        text.includes("deo nui")
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
        text.includes("an toan") ||
        text.includes("adas")
    ) {

        profile.wantsADAS =
            true;
    }

    // =====================
    // SANG TRỌNG
    // =====================

    if (
        text.includes("cao cap") ||
        text.includes("sang trong") ||
        text.includes("noi that đep")
    ) {

        profile.wantsLuxury =
            true;
    }

    // =====================
    // CHỞ HÀNG
    // =====================

    if (
        text.includes("cho hang") ||
        text.includes("ban tai")
    ) {

        profile.cargoNeed =
            true;
    }
    if (
    text.includes("ban tai")
) {
    profile.usage = "business";
    profile.cargoNeed = true;
}
if (
    text.includes("offroad")
) {
    profile.usage = "business";
    profile.wantsOffroad = true;
}

    // =====================
    // XE ĐIỆN
    // =====================

    if (
        text.includes("xe dien") ||
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
        text.includes("du lich") ||
        text.includes("di xa thuong xuyen")
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

