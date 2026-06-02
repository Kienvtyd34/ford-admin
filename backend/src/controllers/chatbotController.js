import stringSimilarity from 'string-similarity';
import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';
import { processSemanticAI, cleanText } from '../nlpManager.js';

// 🧠 QUẢN LÝ TRẠNG THÁI HỘI THOẠI (STATEFUL CONTEXT MEMORY)
const chatMemory = {}; 

export const handleChatInteraction = async (req, res) => {
    try {
        const { message, userId = "default_user" } = req.body;
        if (!message) return res.status(400).json({ text: "Nội dung yêu cầu trống!" });

        // 1. Phân tích ngữ cảnh câu chat
        const { intent, entities } = await processSemanticAI(userId, message);
        
        // 2. CƠ CHẾ KẾ THỪA VÀ RESET THÔNG MINH
        if (!chatMemory[userId]) {
            chatMemory[userId] = { modelName: null, variantName: null, color: null };
        }

        // Nếu người dùng nhắc đến Model mới hoàn toàn -> Reset bộ nhớ để tránh hiểu lầm ngữ cảnh cũ
        if (entities.modelName && chatMemory[userId].modelName && chatMemory[userId].modelName !== entities.modelName) {
            chatMemory[userId] = { modelName: entities.modelName, variantName: null, color: null };
        } else {
            // Kế thừa các thực thể bị khuyết thiếu từ bộ nhớ
            if (!entities.modelName) entities.modelName = chatMemory[userId].modelName;
            if (!entities.variantName) entities.variantName = chatMemory[userId].variantName;
            if (!entities.color) entities.color = chatMemory[userId].color;
        }

        // Cập nhật bộ nhớ với thực thể mới nhất
        if (entities.modelName) chatMemory[userId].modelName = entities.modelName;
        if (entities.variantName) chatMemory[userId].variantName = entities.variantName;
        if (entities.color) chatMemory[userId].color = entities.color;

        // 3. TỐI ƯU TRUY VẤN (Smart Query Builder)
        let reply = "";
        let variantQuery = {};

        if (entities.modelName) {
            const model = await VehicleModel.findOne({ 
                $or: [{ name: { $regex: new RegExp(entities.modelName, "i") } }, { aliases: { $regex: new RegExp(entities.modelName, "i") } }] 
            });
            if (model) variantQuery.modelId = model._id;
        }

        if (entities.variantName) {
            variantQuery.$or = [
                { variantName: { $regex: new RegExp(entities.variantName, "i") } },
                { aliases: { $regex: new RegExp(entities.variantName, "i") } }
            ];
        }

        // =========================================================
        // 4. ĐIỀU PHỐI DỮ LIỆU ĐẦU RA
        // =========================================================
        switch (intent) {
            case 'PRICE_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = `✨ Ford Quế Võ xin chào! Để báo giá chính xác nhất, anh/chị đang quan tâm đến dòng xe nào ạ (Ví dụ: Ranger, Everest, Territory)?`;
                } else {
                    reply = `💰 **BÁO GIÁ XE FORD ${variant.modelId?.name.toUpperCase() || ''}**\n\n` +
                            `🚗 Phiên bản: ${variant.variantName}\n` +
                            `💵 Giá niêm yết: ${variant.basePrice?.toLocaleString('vi-VN') || 'Đang cập nhật'} VNĐ\n\n` +
                            `Anh/chị để lại SĐT, em gửi bảng tính lăn bánh chi tiết tại Quế Võ nhé!`;
                }
                break;
            }

            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = `📋 Anh/chị vui lòng cho em biết tên dòng xe cần xem thông số kỹ thuật ạ?`;
                    break;
                }
                // ... (giữ nguyên logic SPECS_QUERY của bạn, nó đã rất chi tiết rồi)
                break;
            }

            case 'STOCK_QUERY': {
                // Sử dụng Aggregate Pipeline đã chuẩn hóa để tìm kiếm linh hoạt
                let pipeline = [
                    { $match: { status: "Trong kho" } },
                    { $lookup: { from: "variants", localField: "variantId", foreignField: "_id", as: "v" } },
                    { $unwind: "$v" }
                ];
                
                if (variantQuery.modelId) pipeline.push({ $match: { "v.modelId": variantQuery.modelId } });
                
                const stock = await Inventory.aggregate(pipeline);
                if (stock.length > 0) {
                    reply = `🔥 Hiện tại kho Quế Võ đang có sẵn ${stock.length} chiếc xe đáp ứng yêu cầu của anh/chị. Anh/chị muốn xem xe màu gì hay bản nào không ạ?`;
                } else {
                    reply = `📭 Hiện tại dòng xe anh/chị quan tâm đang tạm hết hàng tại kho. Em xin phép lưu thông tin để báo ngay khi có xe về nhé! Anh/chị cho em xin SĐT nhé.`;
                }
                break;
            }

            case 'COLOR_QUERY': {
                const variant = await Variant.findOne(variantQuery);
                if (!variant) {
                    reply = `🎨 Anh/chị đang muốn tìm bảng màu cho dòng xe nào ạ?`;
                } else {
                    const colors = await VehicleColor.find({ variantId: variant._id });
                    reply = `🎨 **BẢNG MÀU NGOẠI THẤT ${variant.variantName}**\n` +
                            (colors.length > 0 ? colors.map(c => `• ${c.name}`).join('\n') : "Dữ liệu màu đang được cập nhật.");
                }
                break;
            }

            default:
                reply = "Dạ, Ford Quế Võ có thể hỗ trợ anh/chị về: Báo giá, Thông số kỹ thuật, Tồn kho hoặc Đặt lịch lái thử. Anh/chị cần hỗ trợ về mục nào ạ?";
                break;
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Controller Error:", error);
        return res.status(500).json({ text: "Hệ thống đang bận, anh/chị đợi chút em phản hồi ngay ạ!" });
    }
};