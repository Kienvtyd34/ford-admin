import stringSimilarity from 'string-similarity';
import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';
import { processSemanticAI, cleanText } from '../nlpManager.js';

export const handleChatInteraction = async (req, res) => {
    try {
        const { message, payload, userId = "DEFAULT_USER" } = req.body;

        if (payload) {
            // (Giữ nguyên phần handleScenarioPayload như cũ...)
            if (payload === 'MENU_WELCOME') {
                return res.json({
                    text: "🤖 Chào mừng anh/chị đến với Trợ lý số Ford Quế Võ! Hệ thống AI đa tầng của em hỗ trợ tra cứu giá, tồn kho, thông số kỹ thuật và tư vấn trả góp tự động. Anh/chị cần hỏi thông tin gì ạ?",
                    buttons: [
                        { title: "💰 Xem giá xe Ford", payload: "MENU_GIA_XE" },
                        { title: "🛠️ Chẩn đoán sự cố xe", payload: "MENU_CHAN_DOAN_LOI" }
                    ]
                });
            }
        }

        if (!message) return res.status(400).json({ text: "Nội dung tin nhắn trống!" });

        // Gửi tin nhắn qua tầng xử lý ngôn ngữ tự nhiên
        const { intent, entities } = await processSemanticAI(userId, message);
        let reply = "";

        let variantQuery = {};
        if (entities.variantName) {
            variantQuery = { variantName: { $regex: new RegExp(entities.variantName, "i") } };
        } else if (entities.modelName) {
            const targetModel = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
            if (targetModel) variantQuery = { modelId: targetModel._id };
        }

        switch (intent) {
            case 'PRICE_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                // 🔴 FIX AN TOÀN: Kiểm tra nếu không tìm thấy phiên bản xe
                if (!variant || !variant.modelId) {
                    reply = `Dạ, dòng xe hoặc phiên bản anh/chị cần tra cứu hiện chưa có thông tin chính thức trên hệ thống dữ liệu Ford Quế Võ. Anh/chị vui lòng bổ sung chính xác tên xe giúp em nhé (Ví dụ: Everest Titanium, Ranger Wildtrak...)`;
                } else {
                    reply = `💰 **Báo giá niêm yết chính hãng:** Dòng xe **${variant.modelId.name} (${variant.variantName})** hiện đang có mức giá công bố là **${variant.basePrice?.toLocaleString('vi-VN') || 'Chưa cập nhật'} VNĐ**.`;
                }
                break;
            }

            // 🌟 Xử lý tư vấn trả góp ngân hàng tự động
            case 'INSTALLMENT_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                // 🔴 FIX AN TOÀN: Kiểm tra nếu không tìm thấy phiên bản xe
                if (!variant || !variant.modelId) {
                    reply = "Dạ, hệ thống chưa xác định được dòng xe cụ thể anh/chị đang muốn tư vấn phương án trả góp. Anh/chị bổ sung tên xe giúp em nhé (Ví dụ: Trả góp Everest, mua trả góp Ranger...)";
                } else {
                    const basePrice = variant.basePrice || 0;
                    const loanAmount = basePrice * 0.8; // Ngân hàng hỗ trợ vay tối đa 80%
                    const monthlyInterestRate = 0.08 / 12; // Lãi suất giả định 8%/năm
                    const loanTermMonths = 96; // Thời gian vay tối đa 8 năm (96 tháng)
                    
                    // Tính tiền gốc + lãi tháng đầu tiên theo phương pháp dư nợ giảm dần
                    const monthlyPrincipal = loanAmount / loanTermMonths;
                    const monthlyInterestFirstMonth = loanAmount * monthlyInterestRate;
                    const totalFirstMonth = monthlyPrincipal + monthlyInterestFirstMonth;

                    reply = `🏦 **Tư vấn gói vay trả góp qua Ngân hàng liên kết Ford Quế Võ:**\n\n` +
                            `• Áp dụng cho dòng xe: **${variant.modelId.name} (${variant.variantName})**\n` +
                            `• Hỗ trợ vay tối đa (80%): **${loanAmount.toLocaleString('vi-VN')} VNĐ**\n` +
                            `• Số tiền anh/chị cần chuẩn bị trước (20%): **${(basePrice - loanAmount).toLocaleString('vi-VN')} VNĐ**\n` +
                            `• Thời hạn vay tối đa: 8 năm (96 tháng)\n` +
                            `• Ước tính số tiền thanh toán tháng đầu tiên (Gốc + Lãi): ~**${Math.round(totalFirstMonth).toLocaleString('vi-VN')} VNĐ/tháng** (các tháng sau giảm dần).\n\n` +
                            `Anh/chị có muốn để lại SĐT để chuyên viên tín dụng lập bảng tính chi tiết thời gian vay không ạ?`;
                }
                break;
            }

            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                // 🔴 FIX AN TOÀN: Kiểm tra nếu không tìm thấy phiên bản xe
                if (!variant || !variant.modelId) {
                    reply = "Dạ, thông tin dòng xe anh/chị cần xem thông số hoặc tính năng hiện không có sẵn trên hệ thống dữ liệu.";
                    break;
                }
                if (entities.feature) {
                    const hasFeature = variant.features?.[entities.feature];
                    if (hasFeature === true) {
                        reply = `Dạ CÓ ạ! Phiên bản xe **${variant.modelId.name} ${variant.variantName}** hoàn toàn được tích hợp sẵn tính năng này từ nhà máy chính hãng.`;
                    } else {
                        reply = `Dạ rất tiếc là phiên bản **${variant.modelId.name} ${variant.variantName}** chưa hỗ trợ tính năng này. Anh/chị có muốn tham khảo bản cao cấp hơn không?`;
                    }
                } else {
                    reply = `ℹ️ **Thông số cốt lõi xe ${variant.modelId.name} [${variant.variantName}]:**\n` +
                            `• Động cơ: ${variant.specs?.engine || 'Đang cập nhật'}\n` +
                            `• Hộp số: ${variant.transmission || 'Đang cập nhật'} | Hệ dẫn động: ${variant.driveTrain || 'Đang cập nhật'}`;
                }
                break;
            }

            case 'COLOR_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                // 🔴 FIX AN TOÀN: Kiểm tra nếu không tìm thấy phiên bản xe
                if (!variant || !variant.modelId) {
                    reply = "Dạ, dòng sản phẩm Ford anh/chị muốn xem danh sách bảng màu hiện chưa có thông tin dữ liệu.";
                    break;
                }
                const dbColors = await VehicleColor.find({ variantId: variant._id });
                if (dbColors.length === 0) {
                    reply = `Dạ, danh mục mã màu của bản **${variant.variantName}** đang được cập nhật thêm ạ.`;
                } else {
                    const matchedColor = dbColors.find(c => cleanText(c.name).includes(entities.color || "KHONG_TRUNG"));
                    if (matchedColor && matchedColor.images?.length > 0) {
                        reply = `Dạ đây là hình ảnh thực tế xe **${variant.modelId.name} ${variant.variantName} màu ${matchedColor.name}** gửi anh/chị:\n🖼️ Link ảnh: ${matchedColor.images[0]}`;
                    } else {
                        const allNames = dbColors.map(c => c.name).join(', ');
                        reply = `🎨 Bảng màu ngoại thất chính hãng của phiên bản **${variant.modelId.name} ${variant.variantName}** bao gồm: **${allNames}** ạ.`;
                    }
                }
                break;
            }

            case 'STOCK_QUERY': {
                let stockFilter = { status: "Trong kho" };
                if (entities.vin) {
                    const item = await Inventory.findOne({ vin: entities.vin }).populate({
                        path: 'variantId', populate: { path: 'modelId' }
                    });
                    // 🔴 FIX AN TOÀN: Kiểm tra sâu cấu trúc object quan hệ của inventory item
                    if (item && item.variantId && item.variantId.modelId) {
                        reply = `🔍 **Kết quả định vị Số Khung [${entities.vin}]:**\n- Xe: ${item.variantId.modelId.name} (${item.variantId.variantName})\n- Trạng thái: ${item.status} (Sẵn xe giao ngay).`;
                    } else {
                        reply = `Dạ, số khung **${entities.vin}** này hiện không tồn tại hoặc dữ liệu liên kết dòng xe đã bị thay đổi trên hệ thống bãi kho Ford Quế Võ.`;
                    }
                    break;
                }

                const variant = await Variant.findOne(variantQuery);
                if (!variant) {
                    reply = "Dạ, dòng xe cụ thể anh/chị muốn check xe sẵn giao ngay hiện chưa khớp dữ liệu trên kho bãi.";
                    break;
                }
                stockFilter.variantId = variant._id;

                const totalInStock = await Inventory.countDocuments(stockFilter);
                if (totalInStock > 0) {
                    reply = `🎉 **Hệ thống kho báo:** Cấu hình xe bạn chọn hiện đang còn sẵn **${totalInStock} xe** trong bãi, sẵn sàng làm thủ tục bàn giao ngay trong tuần!`;
                } else {
                    reply = `Dạ hiện tại phiên bản này đang tạm hết xe sẵn giao ngay. Anh/chị có thể làm hợp đồng ký đặt cọc để đại lý ưu tiên rút xe từ nhà máy về sớm nhất nhé.`;
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
                    let recText = "🤖 **Đề xuất xe phù hợp dựa trên thuật toán nhu cầu:**\n\n";
                    recommendedVariants.forEach((v, index) => {
                        if (v.modelId) { // Check an toàn modelId
                            recText += `${index + 1}️⃣ **Ford ${v.modelId.name} - Bản ${v.variantName}**\n` +
                                       `• Giá niêm yết: ${v.basePrice?.toLocaleString('vi-VN') || 'Chưa cập nhật'} VNĐ\n\n`;
                        }
                    });
                    reply = recText + "Anh/chị có muốn đăng ký một lịch hẹn qua Showroom lái thử trải nghiệm xe thực tế không?";
                } else {
                    reply = "Dạ, tiêu chí tìm kiếm của anh/chị đang hơi đặc thù. Hãy để lại SĐT để tư vấn viên thiết kế phương án tối ưu riêng cho mình nhé!";
                }
                break;
            }

            case 'TECHNICAL_SUPPORT': {
                const allProblems = await CarProblem.find({});
                let selectedProblem = null;
                let highestScore = 0;
                const cleanUserMessage = cleanText(message);

                for (let prob of allProblems) {
                    if (!prob.symptoms) continue; // Check an toàn mảng triệu chứng
                    for (let sym of prob.symptoms) {
                        const score = stringSimilarity.compareTwoStrings(cleanUserMessage, cleanText(sym));
                        if (score > highestScore) {
                            highestScore = score;
                            selectedProblem = prob;
                        }
                    }
                }

                if (highestScore > 0.35 && selectedProblem) {
                    reply = `🛠️ **Kết quả chẩn đoán tự động (Semantic Matching):**\n\n` +
                            `• **Sự cố:** ${selectedProblem.title}\n` +
                            `• **Nguyên nhân:** ${selectedProblem.causes?.join(', ') || 'Đang cập nhật'}\n` +
                            `• **Giải pháp:** ${selectedProblem.solutions?.join(', ') || 'Đang cập nhật'}\n` +
                            `• **Mức độ rủi ro:** [${(selectedProblem.severity || 'Cảnh báo').toUpperCase()}]`;
                } else {
                    reply = "Dạ, hiện tượng này nằm ngoài danh mục tra cứu nhanh tự động. Anh/chị vui lòng cung cấp SĐT, xưởng dịch vụ sẽ cử Cố vấn kỹ thuật gọi điện hướng dẫn xử lý từ xa ngay ạ!";
                }
                break;
            }

            case 'NEWS_QUERY': {
                const recentNews = await News.findOne({ category: { $in: ["Tin tức", "Sự kiện", "Khuyến mãi"] } }).sort({ createdAt: -1 });
                if (recentNews) {
                    reply = `📢 **Tin tức đại lý:**\n• **Tiêu đề:** ${recentNews.title}\n• **Tóm tắt:** ${recentNews.summary}`;
                } else {
                    reply = "Dạ hiện tại chưa có thông báo khuyến mãi mới được cập nhật.";
                }
                break;
            }

            default:
                reply = "Dạ em là trợ lý số tự động tra cứu dữ liệu. Câu hỏi của anh/chị đang nằm ngoài phạm vi cấu hình tự động. Anh/chị vui lòng để lại Số điện thoại để nhân viên hỗ trợ mình ngay nhé ạ! 📞";
                break;
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Lỗi Tầng Controller:", error);
        // Định dạng an toàn cho đầu ra lỗi, tương thích tốt với cấu trúc đọc tin nhắn của Chatbot.jsx
        return res.status(500).json({ text: "Hệ thống AI đang gặp chút sự cố nhỏ. Bạn vui lòng thử lại sau giây lát nhé!" });
    }
};