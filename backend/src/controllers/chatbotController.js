import stringSimilarity from 'string-similarity';

// Import các Models hệ thống
import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';

// Import NLP helper
import { analyzeMessage, removeVietnameseTones } from '../nlpManager.js';

// Khối xử lý kịch bản cố định (Menu Payload)
function handleScenarioPayload(payload) {
    switch (payload) {
        case 'MENU_WELCOME':
            return {
                text: "🚗 Chào mừng anh/chị đến với Trợ lý số Ford Quế Võ!\nEm có thể hỗ trợ anh/chị tra cứu nhanh thông tin gì hôm nay ạ?",
                buttons: [
                    { title: "💰 Xem giá xe Ford", payload: "MENU_GIA_XE" },
                    { title: "🛠️ Chẩn đoán sự cố xe", payload: "MENU_CHAN_DOAN_LOI" },
                    { title: "📅 Tư vấn chọn xe", payload: "MENU_TU_VAN" }
                ]
            };
        case 'MENU_GIA_XE':
            return {
                text: "Anh/chị đang quan tâm giá của dòng xe Ford nào ạ? Hãy gõ tên xe (Ví dụ: Territory, Mach-E) để em tra cứu giá niêm yết ngay nhé!"
            };
        case 'MENU_CHAN_DOAN_LOI':
            return {
                text: "Hệ thống chẩn đoán xưởng xin nghe! Hãy nhập mã lỗi hoặc mô tả hiện tượng xe đang gặp phải (Ví dụ: giật số dps6, hiện đèn cá vàng, lỗi u3000...) để em kiểm tra phương án xử lý."
            };
        case 'MENU_TU_VAN':
            return {
                text: "Anh/chị vui lòng nhập nhu cầu mua xe (Ví dụ: Tài chính 800tr mua xe gia đình, hoặc xe bán tải đi công trường...) để em lọc cấu hình tối ưu nhất!"
            };
        default:
            return null;
    }
}

// Controller chính để xuất khẩu (Export) qua Router
export const handleChatInteraction = async (req, res) => {
    try {
        const { message, payload } = req.body;

        // 1. Kiểm tra nếu người dùng click vào các kịch bản nút bấm
        if (payload) {
            const responseData = handleScenarioPayload(payload);
            if (responseData) return res.json(responseData);
        }

        // 2. Xử lý câu thoại tự do bằng hệ thống NLP + DB
        if (!message) return res.status(400).json({ error: "Nội dung tin nhắn trống!" });

        const { intent, entities } = await analyzeMessage(message);
        let reply = "";

        // Xây dựng Query tìm kiếm động theo Xe
        let variantQuery = {};
        if (entities.variantName) {
            variantQuery = { variantName: { $regex: new RegExp(entities.variantName, "i") } };
        } else if (entities.modelName) {
            const foundModel = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
            if (foundModel) variantQuery = { modelId: foundModel._id };
        }

        // Điều phối các Intent tương ứng 100 câu Testcase
        switch (intent) {
            case 'hoi_gia': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, em chưa tìm thấy phiên bản xe khớp với tên anh/chị cung cấp. Anh/chị kiểm tra lại tên bản xe giúp em nhé (Ví dụ: Territory Titanium X, Mustang Mach-E Premium...)";
                } else {
                    reply = `💰 Giá niêm yết chính hãng hiện tại của dòng xe **${variant.modelId.name} - Phiên bản ${variant.variantName}** là: **${variant.basePrice.toLocaleString('vi-VN')} VNĐ**.`;
                }
                break;
            }

            case 'hoi_thong_so_tinh_nang': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, anh/chị cần xem thông số kỹ thuật chi tiết của phiên bản xe Ford cụ thể nào ạ?";
                    break;
                }

                if (entities.feature) {
                    const hasFeature = variant.features[entities.feature];
                    if (hasFeature === true) {
                        reply = `Dạ CÓ ạ! Phiên bản **${variant.modelId.name} ${variant.variantName}** được trang bị sẵn tính năng hệ thống chính hãng này nên anh/chị hoàn toàn yên tâm nhé!`;
                    } else if (hasFeature === false) {
                        reply = `Dạ tiếc là trên phiên bản **${variant.modelId.name} ${variant.variantName}** chưa có trang bị tính năng này. Anh/chị có muốn tham khảo sang phiên bản cao cấp hơn không?`;
                    } else {
                        reply = `Dạ thông tin tính năng này trên bản **${variant.variantName}** đang được cập nhật thêm ạ.`;
                    }
                } else {
                    reply = `ℹ️ **Thông số cơ bản xe ${variant.modelId.name} [${variant.variantName}]:**\n` +
                            `• Động cơ: ${variant.specs.engine || 'Đang cập nhật'}\n` +
                            `• Hộp số: ${variant.transmission}\n` +
                            `• Hệ dẫn động: ${variant.driveTrain}\n` +
                            `• Nhiên liệu: ${variant.fuelType}\n` +
                            `• Công suất cực đại: ${variant.specs.horsepower || '---'} HP`;
                }
                break;
            }

            case 'hoi_danh_sach_mau': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = "Dạ, anh/chị cần kiểm tra danh sách màu sắc ngoại thất của dòng xe nào ạ?";
                    break;
                }

                const colors = await VehicleColor.find({ variantId: variant._id });
                if (colors.length === 0) {
                    reply = `Dạ hiện dòng xe **${variant.modelId.name} ${variant.variantName}** chưa cập nhật bảng màu cụ thể trên hệ thống dữ liệu nhanh.`;
                } else {
                    const matchedColor = colors.find(c => removeVietnameseTones(c.name).includes(entities.color || "KHO_KHONG_TRUNG"));
                    if (matchedColor && matchedColor.images && matchedColor.images.length > 0) {
                        reply = `Dạ đây là hình ảnh thực tế xe **${variant.modelId.name} ${variant.variantName} màu ${matchedColor.name}** gửi anh/chị tham khảo:\n🖼️ Link ảnh: ${matchedColor.images[0]}`;
                    } else {
                        const colorNames = colors.map(c => c.name).join(', ');
                        reply = `🎨 Phiên bản **${variant.modelId.name} ${variant.variantName}** hiện tại đại lý cung cấp tổng cộng có các tùy chọn màu sắc ngoại thất bao gồm: **${colorNames}** ạ.`;
                    }
                }
                break;
            }

            case 'hoi_ton_kho': {
                let inventoryFilter = { status: "Trong kho" };

                if (entities.vin) {
                    const item = await Inventory.findOne({ vin: entities.vin }).populate({
                        path: 'variantId', populate: { path: 'modelId' }
                    });
                    if (item) {
                        reply = `🔍 **Kết quả tra cứu Số khung [${entities.vin}]:**\n- Dòng xe: ${item.variantId.modelId.name} (${item.variantId.variantName})\n- Phân loại kho: Xe thương mại (${item.category})\n- Trạng thái: ${item.status} (Sẵn sàng giao xe).`;
                    } else {
                        reply = `Dạ mã số khung hoặc số VIN **${entities.vin}** này hiện không tồn tại hoặc chưa làm thủ tục nhập kho của showroom Quế Võ ạ.`;
                    }
                    break;
                }

                const variant = await Variant.findOne(variantQuery);
                if (!variant) {
                    reply = "Dạ anh/chị cần check xe giao ngay cho dòng xe cụ thể nào ạ?";
                    break;
                }
                inventoryFilter.variantId = variant._id;

                if (entities.color) {
                    const colorDoc = await VehicleColor.findOne({ variantId: variant._id, name: { $regex: new RegExp(entities.color, "i") } });
                    if (colorDoc) inventoryFilter.colorId = colorDoc._id;
                }

                const countStock = await Inventory.countDocuments(inventoryFilter);
                if (countStock > 0) {
                    reply = `🎉 Tin vui! Hiện tại trong kho của showroom đang có sẵn **${countStock} xe** đáp ứng đúng cấu hình bạn cần và sẵn sàng làm thủ tục bàn giao ngay trong tuần này ạ!`;
                } else {
                    reply = `Dạ hiện tại phiên bản cấu hình này đang tạm hết xe sẵn giao ngay trong kho. Anh/chị có thể làm hợp đồng ký đặt cọc giữ chỗ để đại lý ưu tiên rút xe từ nhà máy về sớm nhất nhé ạ!`;
                }
                break;
            }

            case 'tu_van_theo_nhu_cau': {
                const { budget, familySize, purpose } = entities;
                let filterQuery = {};

                if (familySize === 7) {
                    const matchedModels = await VehicleModel.find({ seats: 7 });
                    filterQuery.modelId = { $in: matchedModels.map(m => m._id) };
                } else if (purpose === 'cargo') {
                    const matchedModels = await VehicleModel.find({ type: "Pick-up" });
                    filterQuery.modelId = { $in: matchedModels.map(m => m._id) };
                } else if (purpose === 'city') {
                    const matchedModels = await VehicleModel.find({ type: { $in: ["CUV", "Sedan"] } });
                    filterQuery.modelId = { $in: matchedModels.map(m => m._id) };
                }

                if (budget) {
                    filterQuery.basePrice = { $gte: budget - 200000000, $lte: budget + 200000000 };
                }

                const options = await Variant.find(filterQuery).populate('modelId').limit(2);
                if (options.length > 0) {
                    let textResult = "Dạ, căn cứ theo bài toán nhu cầu sử dụng thực tế của anh/chị, em xin đề xuất cấu hình xe Ford phù hợp nhất:\n\n";
                    options.forEach((v, index) => {
                        textResult += `${index + 1}️⃣ **${v.modelId.name} ${v.variantName}**\n` +
                                      `• Giá bán niêm yết: ${v.basePrice.toLocaleString('vi-VN')} VNĐ\n` +
                                      `• Kiểu vận hành: Động cơ ${v.fuelType}, trang bị hộp số ${v.transmission}\n\n`;
                    });
                    textResult += "Anh/chị có muốn đặt lịch qua trực tiếp Showroom trải nghiệm lái thử thực tế dòng này không ạ?";
                    reply = textResult;
                } else {
                    reply = "Dạ hiện tại với các tiêu chí đặc thù trên hệ thống chưa có dòng phiên bản khớp hoàn toàn 100% dữ liệu. Tuy nhiên, showroom luôn có các dòng xe phân khúc đa dụng cực hot. Anh/chị để lại SĐT để em chuyển hồ sơ qua chuyên viên hỗ trợ tư vấn thiết kế riêng dòng xe phù hợp nhé!";
                }
                break;
            }

            case 'hoi_su_co_ky_thuat': {
                const problems = await CarProblem.find({});
                let bestMatch = null;
                let maxScore = 0;
                const cleanUserMsg = removeVietnameseTones(message);

                for (let p of problems) {
                    for (let sym of p.symptoms) {
                        const score = stringSimilarity.compareTwoStrings(cleanUserMsg, removeVietnameseTones(sym));
                        if (score > maxScore) {
                            maxScore = score;
                            bestMatch = p;
                        }
                    }
                }

                if (maxScore > 0.35 && bestMatch) {
                    reply = `🛠️ **Kết quả chẩn đoán kỹ thuật nhanh:**\n\n` +
                            `• **Sự cố:** ${bestMatch.title}\n` +
                            `• **Nguyên nhân tiềm ẩn:** ${bestMatch.causes.join(', ')}\n` +
                            `• **Hướng khắc phục đề xuất:** ${bestMatch.solutions.join(', ')}\n` +
                            `• **Mức độ nghiêm trọng:** [${bestMatch.severity.toUpperCase()}]`;
                } else {
                    reply = "Dạ hiện tượng sự cố kỹ thuật này nằm ngoài danh mục tra cứu nhanh của hệ thống tự động. Anh/chị vui lòng để lại Số điện thoại, xưởng dịch vụ sẽ cử Cố vấn kỹ thuật gọi điện hướng dẫn chẩn đoán từ xa cho mình ngay lập tức ạ!";
                }
                break;
            }

            case 'hoi_tin_tuc_su_kien': {
                const itemNews = await News.findOne({ 
                    $or: [
                        { category: "Sự kiện" },
                        { category: "Khuyến mãi" },
                        { category: "Tin tức" }
                    ]
                }).sort({ createdAt: -1 });

                if (itemNews) {
                    reply = `📢 **Tin tức mới cập nhật từ Đại lý:**\n\n` +
                            `• **Tiêu đề:** ${itemNews.title}\n` +
                            `• **Tóm tắt:** ${itemNews.summary}\n` +
                            `📝 Đọc thêm chi tiết tại trang bài viết của Ford Quế Võ.`;
                } else {
                    reply = "Dạ hiện tại hệ thống tin tức chưa có bài viết mới được đăng tải trong tuần này, em sẽ cập nhật tới anh/chị ngay khi có thông báo mới nhất!";
                }
                break;
            }

            default:
                reply = "Dạ, em là Chatbot tự động hỗ trợ thông tin xe Ford Quế Võ. Câu hỏi của anh/chị nằm ngoài phạm vi xử lý tự động của dữ liệu hệ thống. Anh/chị vui lòng cung cấp Số điện thoại hoặc liên hệ trực tiếp Hotline để tư vấn viên phản hồi chi tiết nhất cho mình nhé! 📞";
                break;
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Lỗi Controller Chat:", error);
        return res.status(500).json({ error: "Lỗi hệ thống xử lý máy chủ dữ liệu!" });
    }
};