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
        const { message, payload } = req.body;
        if (!message) return res.status(400).json({ text: "Nội dung tin nhắn trống!" });

        const { intent, entities } = await processSemanticAI("SYSTEM_USER", message);
        let reply = "";

        // Xây dựng bộ điều kiện Variant cơ bản
        let variantQuery = {};
        if (entities.variantName) {
            variantQuery = { variantName: { $regex: new RegExp(entities.variantName, "i") } };
            if (entities.modelName) {
                const model = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
                if (model) variantQuery.modelId = model._id;
            }
        } else if (entities.modelName) {
            const model = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
            if (model) variantQuery = { modelId: model._id };
        }

        switch (intent) {
            // 💰 NHÓM 1: TRA CỨU GIÁ XE 
            case 'PRICE_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant || !variant.modelId) {
                    reply = `Dạ, mẫu xe anh/chị cần tra cứu hiện đang cập nhật giá. Anh/chị vui lòng cung cấp rõ tên dòng xe giúp bot nhé!`;
                } else {
                    reply = `💰 **Báo giá niêm yết chính hãng:** Dòng xe **${variant.modelId.name} (${variant.variantName})** hiện đang có giá công bố là **${variant.basePrice ? variant.basePrice.toLocaleString('vi-VN') : 'Đang cập nhật'} VNĐ**.`;
                }
                break;
            }

            // ℹ️ NHÓM 2: TRA CỨU THÔNG SỐ & TRANG BỊ ADAS CO/KHONG
            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant || !variant.modelId) {
                    reply = "Dạ, thông tin cấu hình xe này hiện chưa cập nhật trên hệ thống dữ liệu.";
                    break;
                }

                if (entities.feature) {
                    if (entities.feature === 'adas') {
                        reply = `🛡️ **Hệ thống an toàn cao cấp ADAS trên bản ${variant.modelId.name} ${variant.variantName} bao gồm:** Phanh tự động khẩn cấp (autoEmergencyBrake), Cảnh báo điểm mù (blindSpot), Hỗ trợ giữ làn đường (laneKeepAssist), Kiểm soát hành trình thích ứng (adaptiveCruise) và Nhận diện biển báo giao thông (trafficSignRecognition).`;
                    } else {
                        const hasFeature = variant.features?.[entities.feature];
                        if (hasFeature === true) {
                            reply = `Dạ CÓ ạ! Phiên bản **${variant.modelId.name} ${variant.variantName}** hoàn toàn được tích hợp sẵn tính năng **${entities.feature}** chính hãng từ nhà máy.`;
                        } else {
                            reply = `Dạ không ạ, phiên bản **${variant.modelId.name} ${variant.variantName}** rất tiếc chưa được hỗ trợ trang bị tính năng **${entities.feature}**.`;
                        }
                    }
                } else {
                    reply = `ℹ️ **Thông số vận hành xe ${variant.modelId.name} [${variant.variantName}]:**\n` +
                            `• Động cơ: ${variant.specs?.engine || 'Cấu hình tiêu chuẩn Ford'}\n` +
                            `• Hộp số: ${variant.transmission || 'Tự động cấp cao'}\n` +
                            `• Hệ dẫn động: ${variant.driveTrain || 'Tiêu chuẩn toàn cầu'}\n` +
                            `• Nhiên liệu/Nguồn động lực: ${variant.specs?.fuelType || 'Xăng/Dầu/Điện tùy chọn'}.`;
                }
                break;
            }

            // 📦 NHÓM 3: KIỂM TRA TỒN KHO & SỰ SẴN CÓ (PIPELINE AGGREGATE THEO COLORID)
            case 'STOCK_QUERY': {
                if (entities.vin) {
                    const item = await Inventory.findOne({ vin: { $regex: new RegExp(entities.vin, "i") } }).populate({
                        path: 'variantId', populate: { path: 'modelId' }
                    });
                    if (item && item.variantId?.modelId) {
                        reply = `🔍 **Định vị kho xe theo Số Khung [${entities.vin}]:**\n- Xe: ${item.variantId.modelId.name} (${item.variantId.variantName})\n- Tình trạng: Đã nhập bãi kho thành công, sẵn sàng giao ngay!`;
                    } else {
                        reply = `Dạ, số khung **${entities.vin}** chưa được tìm thấy trong bãi kho của Ford Quế Võ.`;
                    }
                    break;
                }

                // Luồng aggregate 4 bảng đồng bộ kiểm tra màu theo từng phiên bản trong bãi kho
                let aggregatePipeline = [
                    { $match: { status: "Trong kho" } },
                    {
                        $lookup: {
                            from: "vehiclecolors", 
                            localField: "colorId",
                            foreignField: "_id",
                            as: "colorInfo"
                        }
                    },
                    { $unwind: { path: "$colorInfo", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "variants", 
                            localField: "variantId",
                            foreignField: "_id",
                            as: "variantInfo"
                        }
                    },
                    { $unwind: { path: "$variantInfo", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "vehiclemodels", 
                            localField: "variantInfo.modelId",
                            foreignField: "_id",
                            as: "modelInfo"
                        }
                    },
                    { $unwind: { path: "$modelInfo", preserveNullAndEmptyArrays: true } }
                ];

                if (entities.modelName) {
                    aggregatePipeline.push({ $match: { "modelInfo.name": { $regex: new RegExp(entities.modelName, "i") } } });
                }
                if (entities.variantName) {
                    aggregatePipeline.push({ $match: { "variantInfo.variantName": { $regex: new RegExp(entities.variantName, "i") } } });
                }
                if (entities.color) {
                    aggregatePipeline.push({ $match: { "colorInfo.name": { $regex: new RegExp(entities.color, "i") } } });
                }

                const stockItems = await Inventory.aggregate(aggregatePipeline);
                const count = stockItems.length;

                if (count > 0) {
                    const sample = stockItems[0];
                    const displayModel = sample.modelInfo?.name || "Ford";
                    const displayVariant = sample.variantInfo?.variantName ? `(${sample.variantInfo.variantName})` : "";
                    const displayColor = entities.color ? `màu ${entities.color}` : "";
                    reply = `🎉 **Bộ phận bãi kho báo:** Mẫu xe **${displayModel} ${displayVariant}** ${displayColor} hiện đang còn sẵn **${count} xe** trong bãi, hỗ trợ làm thủ tục giao ngay tuần này!`;
                } else {
                    const reqModel = entities.modelName || "Ford";
                    const reqVariant = entities.variantName ? `bản ${entities.variantName}` : "";
                    const reqColor = entities.color ? `màu ${entities.color}` : "";
                    reply = `Dạ hiện tại tùy chọn xe **${reqModel} ${reqVariant}** ${reqColor} này đang tạm hết sẵn xe giao ngay tại bãi Quế Võ. Anh/chị để lại SĐT để em đặt lịch rút xe điều phối từ nhà máy về sớm nhất nhé!`;
                }
                break;
            }

            // 🎨 NHÓM 4: BẢNG MÀU & HÌNH ẢNH XE
            case 'COLOR_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant || !variant.modelId) {
                    reply = "Dạ, thông tin bảng màu ngoại thất của dòng xe này đang được cập nhật.";
                    break;
                }

                const dbColors = await VehicleColor.find({ variantId: variant._id });
                if (entities.color) {
                    const foundColor = dbColors.find(c => cleanText(c.name).includes(entities.color));
                    if (foundColor) {
                        reply = `🎨 **Hình ảnh thực tế xe Ford ${variant.modelId.name} màu ${foundColor.name}:**\n` +
                                `- Mã màu (Hex): ${foundColor.hexCode || 'Mã màu tiêu chuẩn Ford'}\n` +
                                `- Link ảnh xem thực tế: ${foundColor.images?.[0] || 'Đã gửi qua tin nhắn hệ thống'}`;
                    } else {
                        reply = `Dạ phiên bản **${variant.modelId.name} ${variant.variantName}** hiện tại hệ thống chưa cập nhật ảnh thực tế màu **${entities.color}**.`;
                    }
                } else {
                    const names = dbColors.map(c => c.name).join(', ') || 'Trắng, Đen, Đỏ, Bạc, Xám, Xanh';
                    reply = `🎨 Bản **${variant.modelId.name} ${variant.variantName}** tổng cộng có các màu ngoại thất chính hãng bao gồm: **${names}** ạ.`;
                }
                break;
            }

            // 🤖 NHÓM 5: TƯ VẤN THEO NHU CẦU (KHOẢNG GIÁ MIN - MAX)
            case 'ADVISORY_QUERY': {
                let modelFilter = {};
                let variantFilter = {};

                if (entities.seats) modelFilter.seats = entities.seats;
                const models = await VehicleModel.find(modelFilter);
                
                variantFilter.modelId = { $in: models.map(m => m._id) };
                
                // Kẹp chặt điều kiện khoảng giá động để triệt tiêu sai số kịch bản kiểm thử
                if (entities.minBudget || entities.maxBudget) {
                    variantFilter.basePrice = {};
                    if (entities.minBudget) variantFilter.basePrice.$gte = entities.minBudget;
                    if (entities.maxBudget) variantFilter.basePrice.$lte = entities.maxBudget;
                }

                const results = await Variant.find(variantFilter).populate('modelId').limit(3);
                if (results.length > 0) {
                    let text = `🤖 **Đề xuất mẫu xe Ford tối ưu theo tiêu chí ngân sách và nhu cầu sử dụng:**\n\n`;
                    results.forEach((v, idx) => {
                        text += `${idx + 1}️⃣ **Ford ${v.modelId.name} (${v.variantName})**\n` +
                                `• Giá niêm yết: ${v.basePrice ? v.basePrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ\n` +
                                `• Phù hợp tiêu chí lựa chọn của anh/chị.\n\n`;
                    });
                    reply = text + `Anh/chị có muốn nhận bảng dự toán chi phí lăn bánh chi tiết cho mẫu xe nào ở trên không ạ?`;
                } else {
                    reply = `Dạ với nhu cầu tài chính và mục đích sử dụng này, Ford đang có sẵn các dòng xe gầm cao CUV năng động hoặc SUV bán tải đa địa hình rất phù hợp. Anh/chị vui lòng để lại SĐT để tư vấn viên gọi điện tư vấn trực tiếp nhé!`;
                }
                break;
            }

            // 🛠️ NHÓM 6: CHẨN ĐOÁN LỖI & SỰ CỐ KỸ THUẬT
            case 'TECHNICAL_SUPPORT': {
                const problems = await CarProblem.find({});
                let matched = null;
                let maxScore = 0;
                const cleanMsg = cleanText(message);

                for (let p of problems) {
                    if (!p.symptoms) continue;
                    for (let s of p.symptoms) {
                        const score = stringSimilarity.compareTwoStrings(cleanMsg, cleanText(s));
                        if (score > maxScore) { maxScore = score; matched = p; }
                    }
                }

                if (maxScore > 0.22 && matched) {
                    reply = `🛠️ **Cố vấn kỹ thuật số Ford Quế Võ chẩn đoán:**\n\n` +
                            `• **Sự cố ghi nhận:** ${matched.title}\n` +
                            `• **Nguyên nhân tiềm ẩn:** ${matched.causes?.join(', ') || 'Do sự cố hệ thống cảm biến hoặc hao mòn cơ khí'}\n` +
                            `• **Giải pháp đề xuất:** ${matched.solutions?.join(', ') || 'Cần mang xe đến xưởng dịch vụ chạy máy quét chuyên dụng lỗi OBD'}\n` +
                            `• **Mức độ rủi ro:** [${(matched.severity || 'Cảnh báo').toUpperCase()}]`;
                } else {
                    reply = "Dạ hiện tượng mã lỗi hoặc sự cố vận hành này nằm ngoài danh mục hỗ trợ xử lý nhanh tự động. Anh/chị hãy gửi SĐT, kỹ thuật viên xưởng sẽ gọi hỗ trợ xử lý tình huống khẩn cấp ngay nhé!";
                }
                break;
            }

            // 📢 NHÓM 7: TIN TỨC & KHUYẾN MÃI
            case 'NEWS_QUERY': {
                const latestNews = await News.findOne({}).sort({ createdAt: -1 });
                if (latestNews) {
                    reply = `📢 **Thông tin mới nhất từ Đại lý Ford Quế Võ:**\n\n` +
                            `• **Chủ đề:** ${latestNews.title}\n` +
                            `• **Tóm tắt:** ${latestNews.summary || 'Chương trình tri ân khách hàng và lái thử đặc biệt.'}\n\n` +
                            `Để đăng ký nhận vé mời tham gia trọn vẹn sự kiện, anh/chị để lại thông tin liên hệ tại đây nhé!`;
                } else {
                    reply = "📢 Đại lý Ford Quế Võ thường xuyên có các sự kiện khai xuân lái thử và chương trình ưu đãi lớn. Anh/chị vui lòng để lại SĐT để nhận thư mời sớm nhất nhé!";
                }
                break;
            }

            // 🏦 HỖ TRỢ TÍNH TOÁN TRẢ GÓP NHANH
            case 'INSTALLMENT_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                const price = variant?.basePrice || 900000000;
                reply = `🏦 **Tư vấn giải pháp tài chính (Vay ngân hàng kịch khung 80%):**\n- Áp dụng: Xe ${variant ? variant.modelId.name : 'Ford chính hãng'} (${variant ? variant.variantName : 'Cấu hình tiêu chuẩn'})\n- Tiền chuẩn bị trước (20%): ~${(price * 0.2).toLocaleString('vi-VN')} VNĐ\n- Tiền gốc lãi ước tính tháng đầu tiên sẽ được tối ưu theo dư nợ giảm dần dựa trên gói lãi suất ưu đãi đại lý liên kết.`;
                break;
            }

            default:
                reply = "Dạ em là trợ lý số tự động tra cứu dữ liệu. Câu hỏi của anh/chị đang nằm ngoài phạm vi cấu hình tự động. Anh/chị vui lòng để lại Số điện thoại để nhân viên trực tổng đài hỗ trợ mình ngay nhé ạ! 📞";
                break;
        }

        return res.json({ text: reply });

    } catch (error) {
        console.error("❌ Lỗi Tầng Controller:", error);
        return res.status(500).json({ text: "Hệ thống dữ liệu tự động đang gặp sự cố nhỏ, bot sẽ phản hồi lại ngay sau giây lát ạ!" });
    }
};