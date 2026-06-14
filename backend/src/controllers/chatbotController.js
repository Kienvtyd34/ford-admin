import stringSimilarity from 'string-similarity';
import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';
import { processSemanticAI, cleanText } from '../nlpManager.js';

// 🧠 QUẢN LÝ TRẠNG THÁI HỘI THOẠI TOÀN CỤC (STATEFUL CONTEXT MEMORY)
const chatMemory = {}; 
const getVariant = async (query) => {
   return await Variant.findOne(query)
      .populate("modelId");
};


export const handleChatInteraction = async (req, res) => {
    try {
         const { message, userId = "default_user" } = req.body;
        const MEMORY_TIMEOUT = 30 * 60 * 1000; // 30 phút

if (
   chatMemory[userId] &&
   Date.now() - chatMemory[userId].updatedAt >
   MEMORY_TIMEOUT
) {
   delete chatMemory[userId];
}
       
        const normalizedMessage = cleanText(message);
        if (!message) return res.status(400).json({ text: "Nội dung yêu cầu trống!" });

        // 1. Phân tích ngữ cảnh
        const { intent, entities } = await processSemanticAI(userId, message);
        let finalIntent = intent;

        const isStockQuestion =
  /(con\s*(hang|xe)?|ton kho|so luong|bao nhieu xe|con hang|mau.*con|con.*mau)/i.test(normalizedMessage);

// override rõ ràng
if (isStockQuestion && entities.color) {
  finalIntent = "STOCK_QUERY";
}

if (entities.color && !isStockQuestion) {
  finalIntent = "COLOR_QUERY";
}
        if (entities.vin) {
    finalIntent = "STOCK_QUERY";
} 
// Ưu tiên 2: Nếu có feature (tính năng) nhưng intent lại là DEFAULT -> Ép về SPECS_QUERY
else if (entities.feature && finalIntent === "DEFAULT") {
    finalIntent = "SPECS_QUERY";
}
// Ưu tiên 3: Nếu có màu sắc nhưng intent lại là DEFAULT -> Ép về COLOR_QUERY
else if (entities.color && finalIntent === "DEFAULT") {
    finalIntent = "COLOR_QUERY";
}
// Ưu tiên 4: Nếu có budget hoặc số chỗ ngồi -> Đảm bảo là CONSULTING_QUERY
else if ((entities.minBudget || entities.maxBudget || entities.seats) && finalIntent === "DEFAULT") {
    finalIntent = "CONSULTING_QUERY";
}
if (
    (
        normalizedMessage.includes("xem anh") ||
        normalizedMessage.includes("xem hinh")
    ) &&
    chatMemory[userId]?.modelName
){
    finalIntent = "COLOR_QUERY";
}
        
        // 2. CƠ CHẾ QUẢN LÝ TRÍ NHỚ THÔNG MINH
        if (!chatMemory[userId]) {
    chatMemory[userId] = {
        modelName: null,
        variantName: null,
        color: null,
        lastIntent: null,
        updatedAt: Date.now()
    };
}

// RESET MEMORY khi đổi intent
if (
    entities.modelName &&
    chatMemory[userId].modelName &&
    cleanText(entities.modelName) !==
    cleanText(chatMemory[userId].modelName)
) {
    chatMemory[userId].variantName = null;
    chatMemory[userId].color = null;
}

        //Reset Memory
        if (
        entities.variantName &&
        chatMemory[userId].variantName &&
        cleanText(entities.variantName) !==
        cleanText(chatMemory[userId].variantName)
        ) {
        chatMemory[userId].color = null;
        }
        chatMemory[userId].lastIntent = intent;
        chatMemory[userId].updatedAt = Date.now();
                // Nếu người dùng nhắc đến Model mới -> Xóa sạch Variant cũ để tránh xung đột
                if (entities.modelName) {

            if (
                chatMemory[userId].modelName &&
                chatMemory[userId].modelName !== entities.modelName
            ) {

                chatMemory[userId] = {
                    modelName: entities.modelName,
                    variantName: null,
                    color: null,
                    lastIntent: intent,
                    updatedAt: Date.now()
                };

            } else {

                chatMemory[userId].modelName =
                    entities.modelName;
            }
        }
        // Cập nhật các thông tin khác nếu có
        if (entities.variantName) chatMemory[userId].variantName = entities.variantName;
        if (entities.color) chatMemory[userId].color = entities.color;

        // 3. XÂY DỰNG TOÁN TỬ TRUY VẤN
        let variantQuery = {};

        // Chỉ tìm theo modelName nếu nó tồn tại trong memory
        if (chatMemory[userId].modelName) {
            const model = await VehicleModel.findOne({ 
                name: { $regex: new RegExp(chatMemory[userId].modelName, "i") } 
            });
            if (model) {
                variantQuery.modelId = model._id;
            } else {
                // Nếu không tìm thấy model (do user gõ sai tên xe), reset memory để tránh lỗi
                chatMemory[userId].modelName = null;
            }
        }

        // Nếu có variantName, mới thêm vào query
        if (chatMemory[userId].variantName) {
            variantQuery.$or = [
                { variantName: { $regex: new RegExp(chatMemory[userId].variantName, "i") } },
                { aliases: { $regex: new RegExp(chatMemory[userId].variantName, "i") } }
            ];
        }

        let reply = "";

        // =========================================================
        // 4. ĐIỀU PHỐI DỮ LIỆU ĐẦU RA (MAPPED TRỰC TIẾP SCHEMA GỐC)
        // =========================================================
        const hasEnoughInfo = ({ seats, maxBudget, minBudget }, msg) =>
            seats ||
            maxBudget ||
            minBudget ||
            msg.includes("7 chỗ") ||
            msg.includes("5 người") ||
            msg.includes("bán tải") ||
            msg.includes("gia đình");

                    switch (finalIntent){
                        
                        // 💡 LUỒNG TƯ VẤN NHU CẦU NGƯỜI DÙNG (MỚI BỔ SUNG)
                        case "CONSULTING_QUERY": {

            // xe điện
            if (
                entities.feature === "electric"
            ) {

                reply =
                    "⚡ Hiện tại mẫu xe điện nổi bật của Ford là Mustang Mach-E. Nếu anh/chị quan tâm xe điện, đây là lựa chọn phù hợp nhất của Ford.";

            }                

            // 7 chỗ
            else if (entities.seats === 7) {

                reply =
                    "🚗 Ford Everest là lựa chọn phù hợp nhất cho gia đình đông người.";

            }

            // 5 chỗ đi phố
            else if (
                entities.seats === 5 ||
                normalizedMessage.includes("di pho")
            ) {

                reply =
                    "🚗 Ford Territory là mẫu CUV 5 chỗ phù hợp nhất cho gia đình đi phố, rộng rãi, nhiều công nghệ và dễ vận hành.";

            }

            // offroad
            else if (
                normalizedMessage.includes("offroad") ||
                normalizedMessage.includes("off road") ||
                normalizedMessage.includes("phuot")||
                normalizedMessage.includes("ban tai") ||
                normalizedMessage.includes("manh me")
            ) {

                reply =
                    "🚗 Ford Ranger Raptor hoặc Ranger Wildtrak là lựa chọn phù hợp để có thể chạy offroad, đi phượt cũng như chở hàng nặng.";

            }

            // ngân sách 2 tỷ
            else if (
            (entities.minBudget || 0) >= 1800000000 ||
            (entities.maxBudget || 0) >= 2000000000
            ){

                reply =
                    "🚗 Với ngân sách khoảng 2 tỷ, anh/chị có thể lựa chọn Ford Ranger Raptor hoặc các phiên bản Everest cao cấp nhất (Titanium 4x4 hoặc Platinum).";

            }

            // dưới 1 tỷ
            else if (
                entities.maxBudget &&
                entities.maxBudget <= 1000000000
            ) {

                reply =
                    "🚗 Tầm dưới 1 tỷ anh/chị có thể tham khảo Ford Territory Trend hoặc Titanium.";

            }

            else {
                if (hasEnoughInfo(entities, message)) {
                    reply =
                        "🚗 Dựa trên nhu cầu của anh/chị, em đề xuất:\n" +
                        "• Ford Territory (đi phố, gia đình nhỏ)\n" +
                        "• Ford Everest (gia đình đông người 7 chỗ)\n" +
                        "• Ford Ranger (bán tải, đa dụng)\n\n" +
                        "Anh/chị muốn em so sánh chi tiết dòng nào không ạ?";
                } else {
                    reply =
                        "Dạ anh/chị cho em biết thêm nhu cầu (7 chỗ / bán tải / đi phố) để em tư vấn chính xác hơn ạ.";
                }
            }

            break;
            }

                        // 💰 LUỒNG TRA CỨU GIÁ XE CHÍNH HÃNG
                      case 'PRICE_QUERY': {

                        let variant = null;
                        let model = null;

                        if (entities.modelName && entities.variantName) {
                        variant = await Variant.findOne({
                            variantName: new RegExp(entities.variantName, "i"),
                            modelId: (await VehicleModel.findOne({
                            name: new RegExp(entities.modelName, "i")
                            }))?._id
                        }).populate("modelId");
                        }
                        // ======================================================
                        // 1. ƯU TIÊN VARIANT TRỰC TIẾP
                        // ======================================================
                        if (chatMemory[userId].variantName) {

                            variant = await Variant.findOne({
                                variantName: {
                                    $regex: new RegExp(chatMemory[userId].variantName, "i")
                                }
                            }).populate("modelId");

                        }

                        // ======================================================
                        // 2. NẾU CÓ MODEL NHƯNG KHÔNG CÓ VARIANT → LIST ALL VARIANTS
                        // ======================================================
                        else if (chatMemory[userId].modelName) {

                            model = await VehicleModel.findOne({
                                name: {
                                    $regex: new RegExp(chatMemory[userId].modelName, "i")
                                }
                            });

                            if (!model) {
                                reply = "❌ Không tìm thấy dòng xe.";
                                break;
                            }

                            let variants = await Variant.find({
                                modelId: model._id
                            });

                            const rawMsg = cleanText(message);

                            // 🔥 nếu user có nhắc variant keyword → lọc lại
                            const matchedVariant = variants.find(v =>
                                cleanText(v.variantName).includes(rawMsg) ||
                                rawMsg.includes(cleanText(v.variantName))
                            );

                            if (matchedVariant) {
                                return res.json({
                                    text:
                                        `💰 **BÁO GIÁ NIÊM YẾT CHÍNH HÃNG** 💰\n` +
                                        `──────────────────\n` +
                                        `🚗 **Dòng xe:** Ford ${model.name}\n` +
                                        `⚙️ **Phiên bản:** ${matchedVariant.variantName}\n` +
                                        `💵 **Giá công bố:** ${matchedVariant.basePrice.toLocaleString("vi-VN")} VNĐ\n`
                                });
                            }

                            reply =
                                `🚗 Ford ${model.name}\n\n` +
                                variants
                                    .map(v =>
                                        `• ${v.variantName}: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
                                    )
                                    .join("\n");

                            break;
                        }

                        // ======================================================
                        // 3. KHÔNG CÓ MEMORY → fallback NLP result
                        // ======================================================
                        else {

                            if (entities.modelName) {

                                model = await VehicleModel.findOne({
                                    name: {
                                        $regex: new RegExp(entities.modelName, "i")
                                    }
                                });

                                if (model && entities.variantName) {

                                    variant = await Variant.findOne({
                                        modelId: model._id,
                                        variantName: {
                                            $regex: new RegExp(entities.variantName, "i")
                                        }
                                    }).populate("modelId");

                                } else if (model) {

                                    const variants = await Variant.find({
                                        modelId: model._id
                                    });

                                    reply =
                                        `🚗 Ford ${model.name}\n\n` +
                                        variants
                                            .map(v =>
                                                `• ${v.variantName}: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
                                            )
                                            .join("\n");

                                    break;
                                }

                            }

                            // fallback cuối
                            variant = await getVariant(variantQuery);
                        }

                        // ======================================================
                        // 4. RESPONSE FINAL
                        // ======================================================
                        if (!variant) {
                            reply = `✨ **Ford Quế Võ Thông Báo** ✨\n\nDạ, anh/chị vui lòng cung cấp rõ dòng xe hoặc phiên bản cụ thể để bot báo giá chính xác nhé!`;
                        } else {
                            const modelName = variant.modelId?.name || "Ford";

                            reply =
                                `💰 **BÁO GIÁ NIÊM YẾT CHÍNH HÃNG** 💰\n` +
                                `──────────────────\n` +
                                `🚗 **Dòng xe:** Ford ${modelName}\n` +
                                `⚙️ **Phiên bản:** ${variant.variantName}\n` +
                                `💵 **Giá công bố:** ${variant.basePrice.toLocaleString('vi-VN')} VNĐ\n` +
                                `──────────────────\n` +
                                `*(Giá chưa bao gồm ưu đãi tại đại lý)*`;
                        }

                        break;
                    }
            // ℹ️ LUỒNG THÔNG SỐ KỸ THUẬT & TRANG BỊ CHUYÊN SÂU (MAPPED 100% TRƯỜNG DỮ LIỆU)
            case 'SPECS_QUERY': {
                const variant = await getVariant(variantQuery);
                if (!variant) {
                    reply = `📋 Thông tin cấu hình dòng xe này hiện chưa được đồng bộ toàn diện trên hệ thống. Anh/chị vui lòng cho bot biết rõ tên dòng xe nhé!`;
                    break;
                }

                const modelName = variant.modelId?.name || "Territory";

                if (entities.feature) {
                    // Tuyến 1: Hệ thống hỗ trợ lái an toàn ADAS
                    if (entities.feature === 'adas') {
                        const hasAdas = variant.features?.adas;
                        reply = hasAdas
                            ? `🛡️ **HỆ THỐNG AN TOÀN CAO CẤP ADAS** 🛡️\n🚗 Xe: **Ford ${modelName} (${variant.variantName})**\n\nPhiên bản này sở hữu gói công nghệ thông minh cao cấp bao gồm:\n• Phanh tự động khẩn cấp (AEB)\n• Cảnh báo điểm mù kết hợp xe cắt ngang (BLIS)\n• Hệ thống kiểm soát hành trình thích ứng (Adaptive Cruise Control)\n• Hỗ trợ giữ làn đường & Cảnh báo lệch làn.`
                            : `❌ Hệ thống xác nhận phiên bản **Ford ${modelName} (${variant.variantName})** chưa được tích hợp gói hỗ trợ an toàn nâng cao ADAS từ nhà máy.`;
                    }
                    // Tuyến 2: Nhiên liệu (Lấy trực tiếp từ tầng ngoài cùng của variant: variant.fuelType)
                    else if (entities.feature.startsWith('fuel_')) {
                        const targetFuel = entities.feature.split('_')[1] === 'gasoline' ? 'Xăng' : 'Dầu';
                        const currentFuel = variant.fuelType || 'Xăng';
                        const isMatch = currentFuel.toLowerCase().includes(targetFuel.toLowerCase());
                        
                        reply = `⛽ **THÔNG TIN CẤU HÌNH NHIÊN LIỆU** ⛽\n` +
                                `──────────────────\n` +
                                `🚗 Mẫu xe **Ford ${modelName} [${variant.variantName}]** sử dụng động cơ vận hành bằng **${currentFuel}**.\n` +
                                `➔ Trả lời: ${isMatch ? 'Dạ CHÍNH XÁC rồi ạ! Mẫu này chạy máy ' + targetFuel : 'Dạ không ạ, phiên bản này chính thức sử dụng cấu hình động cơ máy ' + currentFuel}.`;
                    }
                    // Tuyến 3: Hệ dẫn động (Lấy trực tiếp từ tầng ngoài cùng: variant.driveTrain)
                    else if (entities.feature.startsWith('drive_')) {
                        const targetDrive = entities.feature.split('_')[1].toUpperCase();
                        const currentDrive = variant.driveTrain || 'FWD';
                        const isMatch = currentDrive.toUpperCase().includes(targetDrive);

                        reply = `⚙️ **HỆ DẪN ĐỘNG TRÊN PHÂN KHÚC** ⚙️\n` +
                                `──────────────────\n` +
                                `🚗 Phiên bản **Ford ${modelName} (${variant.variantName})** sử dụng hệ thống dẫn động: **${currentDrive}**.\n` +
                                `➔ Kết luận: ${isMatch ? 'Dạ ĐÚNG rồi ạ! Xe sử dụng hệ dẫn động ' + targetDrive : 'Dạ không ạ, bản này thực tế trang bị hệ dẫn động ' + currentDrive}.`;
                    }
                    // Tuyến 4: Kiểm tra trạng thái Option Boolean con nằm trong object features
                    else {
                        const hasFeature = variant.features?.[entities.feature];
                        const featureLabels = {
                            sunroof: "Cửa sổ trời toàn cảnh",
                            camera360: "Hệ thống Camera 360 độ",
                            autoEmergencyBrake: "Hỗ trợ phanh tự động khẩn cấp",
                            wirelessCharging: "Bệ sạc điện thoại không dây",
                            powerTailgate: "Cốp sau đóng mở bằng điện thông minh",
                            leatherSeat: "Toàn bộ ghế bọc da cao cấp"
                        };
                        const featureNameVi = featureLabels[entities.feature] || "Tính năng cao cấp tùy chọn";
                        
                        if (hasFeature === true) {
                            reply = `✅ **XÁC NHẬN CÓ TRANG BỊ CHÍNH HÃNG** ✅\n\nDạ CÓ ạ! Tính năng **${featureNameVi}** hoàn toàn được tích hợp sẵn nguyên bản trên mẫu xe **Ford ${modelName} ${variant.variantName}**.`;
                        } else {
                            reply = `❌ **XÁC NHẬN CHƯA CÓ TRANG BỊ CHÍNH HÃNG** ❌\n\nDạ không ạ, phiên bản **Ford ${modelName} ${variant.variantName}** rất tiếc chưa được hỗ trợ tính năng **${featureNameVi}**.`;
                        }
                    }
                } else {
                    // Trả về thông số cấu hình tổng quan (Lấy đúng cấu trúc specs lồng trong và trường ngoài)
                    reply = `ℹ️ **THÔNG SỐ VẬN HÀNH CHUYÊN SÂU: FORD ${modelName.toUpperCase()}** ℹ️\n` +
                            `──────────────────\n` +
                            `• 🔹 **Phiên bản chính xác:** ${variant.variantName}\n` +
                            `• 🔹 **Động cơ:** ${variant.specs?.engine || '1.5L EcoBoost'}\n` +
                            `• 🔹 **Mã lực cực đại:** ${variant.specs?.horsepower || '160'} HP\n` +
                            `• 🔹 **Mô-men xoắn:** ${variant.specs?.torque || '248'} Nm\n` +
                            `• 🔹 **Hộp số truyền động:** ${variant.transmission || '7AT'}\n` +
                            `• 🔹 **Hệ dẫn động phân khúc:** ${variant.driveTrain || 'FWD'}\n` +
                            `• 🔹 **Nhiên liệu tiêu thụ:** ${variant.fuelType || 'Xăng'}\n` +
                            `• 🔹 **Số chỗ ngồi thiết kế:** ${variant.specs?.seats || '5'} chỗ\n` +
                            `──────────────────`;
                }
                break;
            }

            // 📦 LUỒNG KIỂM TRA TRẠNG THÁI TỒN KHO VÀ SỐ KHUNG (VIN)
            case 'STOCK_QUERY': {
                // 1. Ưu tiên xử lý nếu có mã VIN
                if (entities.vin) {
                    const item = await Inventory.findOne({ vin: { $regex: new RegExp(entities.vin, "i") } }).populate({
                        path: 'variantId', populate: { path: 'modelId' }
                    });
                    if (item && item.variantId?.modelId) {
                        reply = `🔍 **ĐỊNH VỊ PHÂN PHỐI SỐ KHUNG (VIN)** 🔍\n` +
                                `──────────────────\n` +
                                `• 🆔 **Mã định danh VIN:** ${entities.vin}\n` +
                                `• 🚗 **Dòng xe:** Ford ${item.variantId.modelId.name} (${item.variantId.variantName})\n` +
                                `• 📍 **Trạng thái kho bãi:** Đã kiểm định PDI thành công, sẵn sàng ký hợp đồng giao xe!`;
                    } else {
                        reply = `🔍 Không tìm thấy lịch sử lưu kho đại lý cho mã số khung **${entities.vin}** tại hệ thống Ford Quế Võ.`;
                    }
                    break;
                }

                // 2. Nếu không có VIN, thực hiện truy vấn tồn kho theo variant
                const variant = await getVariant(variantQuery);
                if (!variant) {
                    reply = "Dạ, anh/chị vui lòng cho em biết rõ dòng xe hoặc phiên bản cụ thể để em kiểm tra tồn kho chính xác nhé!";
                    break;
                }
                                
                if (
                normalizedMessage.includes("mau nao") ||
                normalizedMessage.includes("con mau nao") ||
                normalizedMessage.includes("mau nao con hang") ||
                normalizedMessage.includes("con mau gi") ||
                normalizedMessage.includes("mau gi con")
                ) {

                const inventories =
                    await Inventory.find({
                    variantId: variant._id,
                    status: "Trong kho"
                    }).populate("colorId");

                const colorMap = {};

                inventories.forEach(item => {

                    if (!item.colorId) return;

                    const color =
                    item.colorId.name;

                    colorMap[color] =
                    (colorMap[color] || 0) + 1;
                });

                reply =
                    `🎨 Các màu hiện còn trong kho:\n\n`;

                Object.entries(colorMap)
                    .forEach(([color, qty]) => {

                    reply +=
                        `• ${color}: ${qty} xe\n`;
                    });

                break;
                }
                                

                                
                                let inventoryQuery = {
                variantId: variant._id,
                status: "Trong kho"
                };

                if (entities.color) {

                const colorDoc =
                    (
                        await VehicleColor.find({
                            variantId: variant._id
                        })
                    ).find(c =>
                        cleanText(c.name)
                            .includes(
                            cleanText(
                                entities.color
                            )
                            )
                    );

                if (!colorDoc) {

                    const colors =
                        await VehicleColor.find({
                            variantId: variant._id
                        });

                    reply =
                        `❌ ${variant.variantName} không có màu ${entities.color}.\n\n` +
                        `🎨 Các màu hiện có:\n\n` +
                        colors
                            .map(c => `• ${c.name}`)
                            .join("\n");

                    break;
                }

                const stockCount =
                    await Inventory.countDocuments({
                        variantId: variant._id,
                        colorId: colorDoc._id,
                        status: "Trong kho"
                    });

                reply =
                    `📦 TỒN KHO MÀU XE\n` +
                    `──────────────────\n` +
                    `🚗 ${variant.variantName}\n` +
                    `🎨 ${colorDoc.name}\n` +
                    `📊 Hiện còn ${stockCount} xe trong kho`;

                break;
                }

                const stockItems =
                await Inventory.find(
                    inventoryQuery
                );

                const count = stockItems.length;

                if (count > 0) {
                    const displayColor = entities.color ? `màu ${entities.color}` : "tất cả các màu";
                    reply = `📦 **CẬP NHẬT TỒN KHO** 📦\n` +
                            `──────────────────\n` +
                            `🚗 **Dòng xe:** ${variant.variantName}\n` +
                            `🎨 **Tùy chọn:** ${displayColor}\n` +
                            `📊 **Số lượng sẵn sàng:** Hiện đang còn **${count}** xe tại kho Quế Võ.\n` +
                            `──────────────────\n` +
                            `Anh/chị muốn xem ảnh thực tế của phiên bản này không ạ?`;
                } else {
                    reply = `📭 **Thông báo bãi xe:** Phiên bản **${variant.variantName}** hiện tại đang tạm hết hàng trong kho. Anh/chị để lại SĐT, khi nào xe về em báo ngay nhé!`;
                }
                break;
            }

            case 'COLOR_QUERY': {
                const isStockQuestion = /(con\s*(hang|xe)?|ton kho|so luong|bao nhieu xe|con mau|mau.*con|con.*mau)/i.test(normalizedMessage);
                // 1. Lấy dữ liệu model hoặc variant từ memory
                let model = null;
                if (chatMemory[userId].modelName) {
                    model = await VehicleModel.findOne({ 
                        name: { $regex: new RegExp(chatMemory[userId].modelName, "i") } 
                    });
                }

                // 2. Nếu có Variant (hỏi cụ thể phiên bản)
                const variant = await getVariant(variantQuery);
                
                if (variant) {
                    const colors = await VehicleColor.find({ variantId: variant._id });
                    if (isStockQuestion && !entities.color) {
                    break;
                    }
                                        
                    // Người dùng hỏi màu cụ thể: "Bản X có màu Y không?"
                    if (entities.color) {
                        const targetColor = cleanText(entities.color);
                        const colorDoc = colors.find(c => cleanText(c.name).includes(targetColor));

                        if (!colorDoc) {
                            reply = `❌ Rất tiếc, ${variant.variantName} không có màu ${entities.color}.\n` +
                                    `🎨 Các màu hiện có: ${colors.map(c => c.name).join(', ')}.`;
                        } else {
                            // Kiểm tra xem user có muốn xem ảnh không
                            if (normalizedMessage.includes("xem") || normalizedMessage.includes("anh") || normalizedMessage.includes("hinh")) {
                                reply = colorDoc.images?.length > 0 
                                    ? `🎨 ${variant.variantName} màu ${colorDoc.name}:\n📸 Hình ảnh thực tế:\n${colorDoc.images.join("\n")}`
                                    : `📷 Màu ${colorDoc.name} hiện chưa có ảnh mẫu. Anh/chị đợi em cập nhật nhé!`;
                            } else {
                                reply = `✅ Có ạ! ${variant.variantName} có màu ${colorDoc.name}.`;
                            }
                        }
                    } else {
                        // Liệt kê toàn bộ màu của phiên bản
                        reply = `🎨 ${variant.variantName} hiện có ${colors.length} màu:\n• ${colors.map(c => c.name).join('\n• ')}`;
                    }
                } 
                // 3. Nếu chỉ có Model (hỏi chung chung: "Territory có màu gì?")
                    else if (model) {
                        const variants = await Variant.find({ modelId: model._id });
                        const allColors = await VehicleColor.find({ variantId: { $in: variants.map(v => v._id) } });
                        const uniqueColors = [...new Set(allColors.map(c => c.name))];
                        
                        reply = `🎨 Dòng xe Ford ${model.name} hiện có các màu ngoại thất:\n• ${uniqueColors.join('\n• ')}\n\n` +
                                `Anh/chị muốn xem màu của phiên bản nào cụ thể không ạ?`;
                    } 
                    else {
                        reply = "Dạ, anh/chị đang quan tâm đến màu của dòng xe nào ạ? (Ví dụ: Ford Territory, Everest...)";
                    }
                    break;
                }

            // 🏦 HỖ TRỢ GIẢI PHÁP TÀI CHÍNH TRẢ GÓP NGÂN HÀNG
            case 'INSTALLMENT_QUERY': {
                const variant = await getVariant(variantQuery);
                const price = variant?.basePrice || 889000000;
                const displayCar = variant ? `Ford ${variant.modelId?.name || 'Territory'} (${variant.variantName})` : "xe Ford chính hãng";
                
                reply = `🏦 **TƯ VẤN GIẢI PHÁP TÀI CHÍNH (VAY TRẢ GÓP KHUNG TỐI ĐA 80%)** 🏦\n` +
                        `──────────────────\n` +
                        `• 🚗 **Áp dụng dòng xe:** ${displayCar}\n` +
                        `• 💵 **Vốn tự có (20%):** ~${(price * 0.2).toLocaleString('vi-VN')} VNĐ\n` +
                        `• 📉 **Gốc & lãi tính toán:** Tối ưu hóa theo dư nợ giảm dần dựa trên gói lãi suất ưu đãi đại lý Ford liên kết riêng.\n` +
                        `──────────────────\n` +
                        `Anh/chị hãy để lại Số điện thoại để chuyên viên tài chính gọi hỗ trợ thẩm định và duyệt hồ sơ online nhanh chóng trong 5 phút nhé!`;
                break;
            }

            // 🛠️ HỖ TRỢ CHẨN ĐOÁN LỖI KỸ THUẬT XE (Dữ liệu cũ tối ưu giao diện)
            case 'TECHNICAL_SUPPORT': {
                const problems = await CarProblem.find({});
                let matched = null; let maxScore = 0;
                const cleanMsg = cleanText(message);

                for (const problem of problems) {
                for (const symptom of problem.symptoms) {

                    const score =
                        cleanMsg.includes(cleanText(symptom))
                            ? 999
                            : stringSimilarity.compareTwoStrings(
                                cleanMsg,
                                cleanText(symptom)
                            );

                    if (score > maxScore) {
                        maxScore = score;
                        matched = problem;
                    }
                }
                }

                if (maxScore > 0.4 && matched) {
                    reply = `🛠️ **CỐ VẤN DỊCH VỤ SỐ FORD QUẾ VÕ CHẨN ĐOÁN** 🛠️\n` +
                            `──────────────────\n` +
                            `• 🚨 **Sự cố hệ thống:** ${matched.title}\n` +
                            `• 🔍 **Nguyên nhân dự kiến:** ${matched.causes?.join(', ') || 'Xung đột cảm biến tín hiệu ngoại vi'}\n` +
                            `• 💡 **Giải pháp khẩn cấp:** ${matched.solutions?.join(', ') || 'Cần kết nối máy chuyên dụng xóa mã lỗi OBD'}\n` +
                            `• ⚠️ **Mức độ rủi ro:** [ ${matched.severity?.toUpperCase() || 'WARNING'} ]\n` +
                            `──────────────────\n` +
                            `*(Khuyến nghị: Để đảm bảo an toàn tuyệt đối trên mọi hành trình, anh/chị hãy gửi Số điện thoại để kỹ thuật viên xưởng gọi hướng dẫn xử lý khẩn cấp ạ!)*`;
                } else {
                    reply = `🛠️ Hệ thống ghi nhận xe đang có hiện tượng cảnh báo bất thường. Do đây là mã lỗi kỹ thuật chuyên sâu, anh/chị hãy gửi Số điện thoại để cố vấn xưởng dịch vụ gọi hỗ trợ hướng dẫn xử lý tình huống khẩn cấp ngay lập tức nhé!`;
                }
                break;
            }

            // 📢 BẢN TIN SỰ KIỆN KHUYẾN MÃI ĐẠI LÝ
            case 'NEWS_QUERY': {
                const latestNews = await News.findOne({}).sort({ createdAt: -1 });
                if (latestNews) {
                    reply = `📢 **BẢN TIN SỰ KIỆN & ƯU ĐÃI ĐẠI LÝ** 📢\n` +
                            `──────────────────\n` +
                            `• 📝 **Chủ đề chính:** ${latestNews.title}\n` +
                            `• 📌 **Nội dung tóm tắt:** ${latestNews.summary || 'Chương trình ưu đãi ngày vàng lái thử xe Ford mới.'}\n` +
                            `──────────────────\n\n` +
                            `Để nhận vé mời tham gia trọn vẹn sự kiện và nhận các phần quà đặc biệt, anh/chị hãy để lại thông tin liên hệ tại đây nhé!`;
                } else {
                    reply = `📢 Đại lý Ford Quế Võ liên tục tổ chức các sự kiện lái thử trải nghiệm xe bốc thăm trúng thưởng lớn. Anh/chị vui lòng để lại SĐT để nhận thư mời tham dự sớm nhất nhé!`;
                }
                break;
            }

            default: {
                reply = "Dạ em là trợ lý số tự động Ford Quế Võ. Anh/chị cần em hỗ trợ check giá, thông số kỹ thuật hay tồn kho dòng xe nào ạ?";
                break;
            }
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Lỗi Tầng Controller Tổng:", error);
        return res.status(500).json({ text: "Hệ thống dữ liệu tự động đang gặp sự cố nhỏ, bot sẽ phản hồi lại ngay sau giây lát ạ!" });
    }
};