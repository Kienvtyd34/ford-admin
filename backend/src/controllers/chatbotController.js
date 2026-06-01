import stringSimilarity from 'string-similarity';
import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';
import { processSemanticAI, cleanText } from '../nlpManager.js';

// Luồng kịch bản Menu cố định
function handleScenarioPayload(payload) {
    switch (payload) {
        case 'MENU_WELCOME':
            return {
                text: "🤖 Chào mừng anh/chị đến với Trợ lý số Ford Quế Võ!\nHệ thống AI đa tầng của em có thể hỗ trợ anh/chị giải đáp mọi câu hỏi tự do. Anh/chị cần hỗ trợ gì ạ?",
                buttons: [
                    { title: "💰 Xem giá xe Ford", payload: "MENU_GIA_XE" },
                    { title: "🛠️ Chẩn đoán sự cố xe", payload: "MENU_CHAN_DOAN_LOI" },
                    { title: "📢 Tin khuyến mãi mới nhất", payload: "MENU_NEWS" }
                ]
            };
        case 'MENU_GIA_XE':
            return { text: "Anh/chị vui lòng nhập tên xe kèm phiên bản muốn xem giá (Ví dụ: 'Giá xe Everest Titanium' hoặc 'Territory bao nhiêu tiền?')." };
        case 'MENU_CHAN_DOAN_LOI':
            return { text: "Hệ thống hỗ trợ kỹ thuật trực tuyến xin nghe! Xin vui lòng nhập triệu chứng hoặc mã lỗi xe gặp phải (Ví dụ: 'xe bị lỗi u3000 abs' hoặc 'xe bị giật số')." };
        case 'MENU_NEWS':
            return { text: "Anh/chị muốn xem tin tức gì ạ? Hãy gõ các câu như 'Xem tin khuyến mãi mới nhất' nha." };
        default:
            return null;
    }
}

// Hàm Controller chính xử lý Request API
export const handleChatInteraction = async (req, res) => {
    try {
        const { message, payload, userId = "DEFAULT_USER" } = req.body;

        // Luồng 1: Xử lý Kịch bản Payload cố định
        if (payload) {
            const staticResponse = handleScenarioPayload(payload);
            if (staticResponse) return res.json(staticResponse);
        }

        // Luồng 2: Xử lý Ngôn ngữ tự nhiên nâng cao (Xử lý 100 Testcase báo cáo)
        if (!message) return res.status(400).json({ error: "Nội dung tin nhắn trống!" });

        // Gửi qua tầng Kiến trúc AI xử lý ngữ nghĩa đa tầng
        const { intent, entities } = await processSemanticAI(userId, message);
        let reply = "";

        // Build Query xe chung dựa trên Entities bóc tách được
        let variantQuery = {};
        if (entities.variantName) {
            variantQuery = { variantName: { $regex: new RegExp(entities.variantName, "i") } };
        } else if (entities.modelName) {
            const targetModel = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
            if (targetModel) variantQuery = { modelId: targetModel._id };
        }

        // Tầng phản hồi dựa trên Intent Detection
        switch (intent) {
            case 'PRICE_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, hệ thống chưa định vị được chính xác phiên bản xe Ford anh/chị cần tra cứu giá. Anh/chị có thể nói rõ hơn tên phiên bản được không ạ? (Ví dụ: Everest Titanium, Ranger Wildtrak...)";
                } else {
                    reply = `💰 **Báo giá niêm yết chính hãng:** Dòng xe **${variant.modelId.name} (${variant.variantName})** hiện đang có mức giá công bố là **${variant.basePrice.toLocaleString('vi-VN')} VNĐ**.`;
                }
                break;
            }

            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, anh/chị cần xem thông tin thông số kỹ thuật chi tiết của dòng xe hoặc phiên bản cụ thể nào của Ford ạ?";
                    break;
                }

                if (entities.feature) {
                    const hasFeature = variant.features[entities.feature];
                    if (hasFeature === true) {
                        reply = `Dạ CÓ ạ! Phiên bản xe **${variant.modelId.name} ${variant.variantName}** hoàn toàn được tích hợp sẵn hệ thống tính năng này từ nhà máy chính hãng sản xuất.`;
                    } else {
                        reply = `Dạ rất tiếc là trên phiên bản **${variant.modelId.name} ${variant.variantName}** chưa hỗ trợ tính năng này ạ. Anh/chị có muốn chuyển hướng xem phiên bản cao cấp hơn không?`;
                    }
                } else {
                    reply = `ℹ️ **Thông số kỹ thuật cốt lõi xe ${variant.modelId.name} [${variant.variantName}]:**\n` +
                            `• Hệ truyền động: Động cơ ${variant.specs.engine || 'Đang cập nhật'}\n` +
                            `• Kiểu hộp số: ${variant.transmission}\n` +
                            `• Hệ thống dẫn động: ${variant.driveTrain}\n` +
                            `• Loại nhiên liệu: ${variant.fuelType}`;
                }
                break;
            }

            case 'COLOR_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, anh/chị muốn xem danh sách bảng màu hoặc hình ảnh xe của dòng sản phẩm Ford nào ạ?";
                    break;
                }

                const dbColors = await VehicleColor.find({ variantId: variant._id });
                if (dbColors.length === 0) {
                    reply = `Dạ, danh mục mã màu ngoại thất của bản **${variant.variantName}** đang được bộ phận quản trị cập nhật thêm hình ảnh lên hệ thống ạ.`;
                } else {
                    const matchedColor = dbColors.find(c => cleanText(c.name).includes(entities.color || "KHONG_TRUNG_LAP"));
                    if (matchedColor && matchedColor.images && matchedColor.images.length > 0) {
                        reply = `Dạ đây là hình ảnh phối cảnh thực tế xe **${variant.modelId.name} ${variant.variantName}** tùy chọn phiên bản màu **${matchedColor.name}** gửi anh/chị:\n🖼️ Giao diện ảnh: ${matchedColor.images[0]}`;
                    } else {
                        const allNames = dbColors.map(c => c.name).join(', ');
                        reply = `🎨 Bảng màu ngoại thất chính hãng của phiên bản **${variant.modelId.name} ${variant.variantName}** hiện bao gồm các màu: **${allNames}** ạ.`;
                    }
                }
                break;
            }

            case 'STOCK_QUERY': {
                let stockFilter = { status: "Trong kho" };

                // Nếu khách hàng cung cấp số khung trực tiếp (Check tồn kho theo thực thể VIN)
                if (entities.vin) {
                    const inventoryItem = await Inventory.findOne({ vin: entities.vin }).populate({
                        path: 'variantId', populate: { path: 'modelId' }
                    });
                    if (inventoryItem) {
                        reply = `🔍 **Hệ thống định vị Số Khung [${entities.vin}]:**\n- Phân loại: ${inventoryItem.variantId.modelId.name} (${inventoryItem.variantId.variantName})\n- Trạng thái xe: ${inventoryItem.status} (Sẵn xe giao ngay cho khách hàng).`;
                    } else {
                        reply = `Dạ, mã số VIN/Số khung **${entities.vin}** này hiện không tồn tại hoặc chưa hoàn tất thủ tục đăng ký nhập bãi kho tại Ford Quế Võ.`;
                    }
                    break;
                }

                const variant = await Variant.findOne(variantQuery);
                if (!variant) {
                    reply = "Dạ, anh/chị muốn kiểm tra trạng thái xe có sẵn hàng giao ngay cho dòng xe cụ thể nào ạ?";
                    break;
                }
                stockFilter.variantId = variant._id;

                if (entities.color) {
                    const matchedColorDoc = await VehicleColor.findOne({ variantId: variant._id, name: { $regex: new RegExp(entities.color, "i") } });
                    if (matchedColorDoc) stockFilter.colorId = matchedColorDoc._id;
                }

                const totalInStock = await Inventory.countDocuments(stockFilter);
                if (totalInStock > 0) {
                    reply = `🎉 **Tin vui từ Hệ thống kho:** Cấu hình xe bạn chọn hiện đang còn sẵn **${totalInStock} xe** trong bãi kho của showroom, hoàn toàn đủ điều kiện làm thủ tục bàn giao xe ngay lập tức!`;
                } else {
                    reply = `Dạ hiện tại phiên bản cấu hình này đang tạm thời hết xe sẵn giao ngay. Anh/chị có thể để lại thông tin để làm hợp đồng đặt giữ chỗ ưu tiên nhận lô xe xuất xưởng sớm nhất từ nhà máy ạ.`;
                }
                break;
            }

            case 'ADVISORY_QUERY': {
                const { budget, familySize } = entities;
                let advisoryFilter = {};

                if (familySize === 7) {
                    const m7Seats = await VehicleModel.find({ seats: 7 });
                    advisoryFilter.modelId = { $in: m7Seats.map(m => m._id) };
                }
                if (budget) {
                    advisoryFilter.basePrice = { $gte: budget - 150000000, $lte: budget + 150000000 };
                }

                const recommendedVariants = await Variant.find(advisoryFilter).populate('modelId').limit(2);
                if (recommendedVariants.length > 0) {
                    let recommendationText = "🤖 **Đề xuất từ Trợ lý AI dựa trên bài toán nhu cầu:**\n\n";
                    recommendedVariants.forEach((v, index) => {
                        recommendationText += `${index + 1}️⃣ **Ford ${v.modelId.name} - Bản ${v.variantName}**\n` +
                                              `• Giá niêm yết công bố: ${v.basePrice.toLocaleString('vi-VN')} VNĐ\n` +
                                              `• Thông số máy: Động cơ ${v.fuelType}, hộp số ${v.transmission}\n\n`;
                    });
                    reply = recommendationText + "Anh/chị có muốn đăng ký một lịch hẹn qua Showroom lái thử trải nghiệm thực tế dòng xe này không?";
                } else {
                    reply = "Dạ, tiêu chí cấu hình anh/chị cần tìm hiện đang hơi đặc thù so với phân khúc sẵn có. Anh/chị để lại SĐT để em báo bạn tư vấn viên liên hệ hỗ trợ thiết kế phương án tối ưu nhé!";
                }
                break;
            }

            case 'TECHNICAL_SUPPORT': {
                const allProblems = await CarProblem.find({});
                let selectedProblem = null;
                let highestSimilarityScore = 0;
                const cleanUserMessage = cleanText(message);

                for (let prob of allProblems) {
                    for (let sym of prob.symptoms) {
                        const score = stringSimilarity.compareTwoStrings(cleanUserMessage, cleanText(sym));
                        if (score > highestSimilarityScore) {
                            highestSimilarityScore = score;
                            selectedProblem = prob;
                        }
                    }
                }

                if (highestSimilarityScore > 0.35 && selectedProblem) {
                    reply = `🛠️ **Kết quả chẩn đoán sự cố tự động (Semantic AI):**\n\n` +
                            `• **Hiện tượng lỗi:** ${selectedProblem.title}\n` +
                            `• **Nguyên nhân cốt lõi:** ${selectedProblem.causes.join(', ')}\n` +
                            `• **Giải pháp khắc phục xưởng:** ${selectedProblem.solutions.join(', ')}\n` +
                            `• **Mức độ rủi ro kỹ thuật:** [${selectedProblem.severity.toUpperCase()}]`;
                } else {
                    reply = "Dạ, hiện tượng kỹ thuật này chưa nằm trong danh mục xử lý nhanh tự động. Anh/chị vui lòng cung cấp Số điện thoại, cố vấn dịch vụ của xưởng Ford Quế Võ sẽ gọi điện hỗ trợ bắt bệnh và xử lý từ xa ngay ạ!";
                }
                break;
            }

            case 'NEWS_QUERY': {
                const recentNews = await News.findOne({ category: { $in: ["Tin tức", "Sự kiện", "Khuyến mãi"] } }).sort({ createdAt: -1 });
                if (recentNews) {
                    reply = `📢 **Sự kiện & Khuyến mãi mới nhất từ Đại lý:**\n\n` +
                            `• **Chủ đề:** ${recentNews.title}\n` +
                            `• **Nội dung tóm lược:** ${recentNews.summary}\n` +
                            `👉 Chi tiết xem thêm tại trang bài viết chuyên đề của Showroom.`;
                } else {
                    reply = "Dạ hiện tại chương trình ưu đãi mới đang được phê duyệt, em sẽ cập nhật sớm nhất tới anh/chị khi có thông báo chính thức.";
                }
                break;
            }

            default:
                reply = "Dạ em là trợ lý số tự động tra cứu dữ liệu. Câu hỏi của anh/chị đang nằm ngoài phạm vi cấu hình tự động. Anh/chị có thể chat lại rõ hơn hoặc để lại Số điện thoại để nhân viên hỗ trợ mình ngay nhé ạ! 📞";
                break;
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Lỗi xử lý tại Tầng Controller:", error);
        return res.status(500).json({ error: "Lỗi hệ thống máy chủ xử lý dữ liệu." });
    }
};