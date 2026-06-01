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

export const handleChatInteraction = async (req, res) => {
    try {
        const { message, userId = "default_user" } = req.body;
        if (!message) return res.status(400).json({ text: "Nội dung yêu cầu trống!" });

        // 1. Phân tích ngữ cảnh câu chat hiện tại bằng hệ thống NLP nâng cao
        const { intent, entities } = await processSemanticAI(userId, message);
        
        // 2. 🧩 CƠ CHẾ KẾ THỪA VÀ NGẮT ĐOẠN CHAT THÔNG MINH
        if (!chatMemory[userId]) {
            chatMemory[userId] = { modelName: null, variantName: null, color: null };
        }

        // --- PHẦN BỔ SUNG: NGẮT ĐOẠN CHAT THÔNG MINH ---
        // Nếu người dùng nhắc tới một model mới khác với model trong bộ nhớ -> Reset bộ nhớ để tránh nhầm lẫn
        if (entities.modelName && chatMemory[userId].modelName && 
            entities.modelName.toLowerCase() !== chatMemory[userId].modelName.toLowerCase()) {
            chatMemory[userId] = { modelName: entities.modelName, variantName: null, color: null };
        }
        // ----------------------------------------------

        // Kế thừa dữ liệu nếu câu hiện tại bị khuyết thiếu thực thể
        if (!entities.modelName && chatMemory[userId].modelName) {
            entities.modelName = chatMemory[userId].modelName;
        }
        if (!entities.variantName && chatMemory[userId].variantName) {
            entities.variantName = chatMemory[userId].variantName;
        }
        if (!entities.color && chatMemory[userId].color) {
            entities.color = chatMemory[userId].color;
        }

        // Cập nhật đè trạng thái mới nhất vào bộ nhớ RAM hệ thống
        if (entities.modelName) chatMemory[userId].modelName = entities.modelName;
        if (entities.variantName) chatMemory[userId].variantName = entities.variantName;
        if (entities.color) chatMemory[userId].color = entities.color;

        // =========================================================
        // 3. XÂY DỰNG TOÁN TỬ TRUY VẤN MẠNG ALIASES VÀ MODEL CHUẨN XÁC
        // =========================================================
        let reply = "";
        let variantQuery = {};

        // Xác thực ID dòng xe cha (VehicleModel)
        if (entities.modelName) {
            const model = await VehicleModel.findOne({ name: { $regex: new RegExp(entities.modelName, "i") } });
            if (model) {
                variantQuery.modelId = model._id;
            }
        }

        // Truy vấn đa luồng: Khớp cả tên trực tiếp và mảng aliases của tài liệu Variant
        if (entities.variantName) {
            variantQuery.$or = [
                { variantName: { $regex: new RegExp(entities.variantName, "i") } },
                { aliases: { $regex: new RegExp(entities.variantName, "i") } }
            ];
        }

        // =========================================================
        // 4. ĐIỀU PHỐI DỮ LIỆU ĐẦU RA (MAPPED TRỰC TIẾP SCHEMA GỐC)
        // =========================================================
        switch (intent) {
            
            // 💰 LUỒNG TRA CỨU GIÁ XE CHÍNH HÃNG
            case 'PRICE_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = `✨ **Ford Quế Võ Thông Báo** ✨\n\nDạ, thông tin giá bán của dòng xe này đang được cập nhật. Anh/chị vui lòng cung cấp rõ tên dòng xe hoặc phiên bản cụ thể để bot check giá chính xác nhé!`;
                } else {
                    const modelName = variant.modelId?.name || "Territory";
                    reply = `💰 **BÁO GIÁ NIÊM YẾT CHÍNH HÃNG** 💰\n` +
                            `──────────────────\n` +
                            `🚗 **Dòng xe:** Ford ${modelName}\n` +
                            `⚙️ **Phiên bản:** ${variant.variantName}\n` +
                            `💵 **Giá công bố:** ${variant.basePrice ? variant.basePrice.toLocaleString('vi-VN') : 'Đang cập nhật'} VNĐ\n` +
                            `──────────────────\n` +
                            `*(Lưu ý: Giá trên chưa bao gồm chương trình giảm thuế và các gói quà tặng phụ kiện tại đại lý).*`;
                }
                break;
            }

            // ℹ️ LUỒNG THÔNG SỐ KỸ THUẬT & TRANG BỊ CHUYÊN SÂU
            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = `📋 Thông tin cấu hình dòng xe này hiện chưa được đồng bộ toàn diện trên hệ thống. Anh/chị vui lòng cho bot biết rõ tên dòng xe nhé!`;
                    break;
                }

                const modelName = variant.modelId?.name || "Territory";

                if (entities.feature) {
                    if (entities.feature === 'adas') {
                        const hasAdas = variant.features?.adas;
                        reply = hasAdas
                            ? `🛡️ **HỆ THỐNG AN TOÀN CAO CẤP ADAS** 🛡️\n🚗 Xe: **Ford ${modelName} (${variant.variantName})**\n\nPhiên bản này sở hữu gói công nghệ thông minh cao cấp bao gồm:\n• Phanh tự động khẩn cấp (AEB)\n• Cảnh báo điểm mù kết hợp xe cắt ngang (BLIS)\n• Hệ thống kiểm soát hành trình thích ứng (Adaptive Cruise Control)\n• Hỗ trợ giữ làn đường & Cảnh báo lệch làn.`
                            : `❌ Hệ thống xác nhận phiên bản **Ford ${modelName} (${variant.variantName})** chưa được tích hợp gói hỗ trợ an toàn nâng cao ADAS từ nhà máy.`;
                    }
                    else if (entities.feature.startsWith('fuel_')) {
                        const targetFuel = entities.feature.split('_')[1] === 'gasoline' ? 'Xăng' : 'Dầu';
                        const currentFuel = variant.fuelType || 'Xăng';
                        const isMatch = currentFuel.toLowerCase().includes(targetFuel.toLowerCase());
                        
                        reply = `⛽ **THÔNG TIN CẤU HÌNH NHIÊN LIỆU** ⛽\n` +
                                `──────────────────\n` +
                                `🚗 Mẫu xe **Ford ${modelName} [${variant.variantName}]** sử dụng động cơ vận hành bằng **${currentFuel}**.\n` +
                                `➔ Trả lời: ${isMatch ? 'Dạ CHÍNH XÁC rồi ạ! Mẫu này chạy máy ' + targetFuel : 'Dạ không ạ, phiên bản này chính thức sử dụng cấu hình động cơ máy ' + currentFuel}.`;
                    }
                    else if (entities.feature.startsWith('drive_')) {
                        const targetDrive = entities.feature.split('_')[1].toUpperCase();
                        const currentDrive = variant.driveTrain || 'FWD';
                        const isMatch = currentDrive.toUpperCase().includes(targetDrive);

                        reply = `⚙️ **HỆ DẪN ĐỘNG TRÊN PHÂN KHÚC** ⚙️\n` +
                                `──────────────────\n` +
                                `🚗 Phiên bản **Ford ${modelName} (${variant.variantName})** sử dụng hệ thống dẫn động: **${currentDrive}**.\n` +
                                `➔ Kết luận: ${isMatch ? 'Dạ ĐÚNG rồi ạ! Xe sử dụng hệ dẫn động ' + targetDrive : 'Dạ không ạ, bản này thực tế trang bị hệ dẫn động ' + currentDrive}.`;
                    }
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

                let aggregatePipeline = [
                    { $match: { status: "Trong kho" } },
                    { $lookup: { from: "vehiclecolors", localField: "colorId", foreignField: "_id", as: "colorInfo" } },
                    { $unwind: { path: "$colorInfo", preserveNullAndEmptyArrays: true } },
                    { $lookup: { from: "variants", localField: "variantId", foreignField: "_id", as: "variantInfo" } },
                    { $unwind: { path: "$variantInfo", preserveNullAndEmptyArrays: true } },
                    { $lookup: { from: "vehiclemodels", localField: "variantInfo.modelId", foreignField: "_id", as: "modelInfo" } },
                    { $unwind: { path: "$modelInfo", preserveNullAndEmptyArrays: true } }
                ];

                if (entities.modelName) aggregatePipeline.push({ $match: { "modelInfo.name": { $regex: new RegExp(entities.modelName, "i") } } });
                if (entities.variantName) {
                    aggregatePipeline.push({
                        $match: {
                            $or: [
                                { "variantInfo.variantName": { $regex: new RegExp(entities.variantName, "i") } },
                                { "variantInfo.aliases": { $regex: new RegExp(entities.variantName, "i") } }
                            ]
                        }
                    });
                }
                if (entities.color) aggregatePipeline.push({ $match: { "colorInfo.name": { $regex: new RegExp(entities.color, "i") } } });

                const stockItems = await Inventory.aggregate(aggregatePipeline);
                const count = stockItems.length;

                if (count > 0) {
                    const sample = stockItems[0];
                    const displayModel = sample.modelInfo?.name || "Territory";
                    const displayVariant = sample.variantInfo?.variantName ? `(${sample.variantInfo.variantName})` : "";
                    const displayColor = entities.color ? `Màu ${entities.color}` : "Tất cả tùy chọn màu ngoại thất";

                    reply = `📦 **CẬP NHẬT DỮ LIỆU TỒN KHO ĐẠI LÝ** 📦\n` +
                            `──────────────────\n` +
                            `• 🚗 **Dòng xe:** Ford ${displayModel} ${displayVariant}\n` +
                            `• 🎨 **Tùy chọn màu sắc:** ${displayColor}\n` +
                            `• 📊 **Số lượng sẵn sàng:** 🔥 **Hiện đang còn ${count} xe tại bãi bến** 🔥\n` +
                            `──────────────────\n` +
                            `🎉 Xe đã qua kiểm định kỹ thuật đầu vào, hỗ trợ hoàn thiện thủ tục giao ngay cho anh/chị!`;
                } else {
                    const reqModel = entities.modelName || "Territory";
                    const reqVariant = entities.variantName ? `bản ${entities.variantName}` : "";
                    const reqColor = entities.color ? `màu ${entities.color}` : "";

                    reply = `📭 **Thông báo bãi xe:** Tùy chọn dòng xe **Ford ${reqModel} ${reqVariant}** ${reqColor} hiện đang tạm hết xe sẵn tại bãi kho Quế Võ.\n\n` +
                            `Anh/chị vui lòng để lại Số điện thoại, trợ lý kinh doanh sẽ check lịch xe tổng xuất xưởng về sớm nhất cho mình!`;
                }
                break;
            }

            case 'COLOR_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                if (!variant) {
                    reply = `🎨 Dữ liệu bảng màu phối của dòng xe này đang được cập nhật lại từ phòng thiết kế.`;
                    break;
                }
                const modelName = variant.modelId?.name || "Territory";
                const dbColors = await VehicleColor.find({ variantId: variant._id });
                const names = dbColors.map(c => c.name).join(', ') || 'Trắng Ngọc Trai, Đen Đậm, Đỏ Ruby, Bạc Metallic';
                
                reply = `🎨 **DANH SÁCH MÀU SẮC NGOẠI THẤT CHÍNH HÃNG** 🎨\n\n` +
                        `Phiên bản **Ford ${modelName} (${variant.variantName})** sở hữu các gam màu ngoại thất thiết kế bao gồm:\n` +
                        `➔ 📍 **Màu sắc thực tế:** [ ${names} ]\n\n` +
                        `Anh/chị thích phối màu nào nhất ở trên, nhắn lại tên màu bot gửi ảnh thực xe qua ngay nhé!`;
                break;
            }

            case 'INSTALLMENT_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
                const price = variant?.basePrice || 889000000;
                const displayCar = variant ? `Ford ${variant.modelId?.name || 'Territory'} (${variant.variantName})` : "xe Ford chính hãng";
                
                reply = `🏦 **TƯ VẤN GIẢI PHÁP TÀI CHÍNH (VAY TRẢ GÓP KHUNG TỐI ĐA 80%)** 🏦\n` +
                        `──────────────────\n` +
                        `• 🚗 **Áp dụng dòng xe:** ${displayCar}\n` +
                        `• 💵 **Vốn tự có chuẩn bị trước (20%):** ~${(price * 0.2).toLocaleString('vi-VN')} VNĐ\n` +
                        `• 📉 **Gốc & lãi tính toán:** Tối ưu hóa theo dư nợ giảm dần dựa trên gói lãi suất ưu đãi đại lý Ford liên kết riêng.\n` +
                        `──────────────────\n` +
                        `Anh/chị hãy để lại Số điện thoại để chuyên viên tài chính gọi hỗ trợ thẩm định và duyệt hồ sơ online nhanh chóng trong 5 phút nhé!`;
                break;
            }

            case 'TECHNICAL_SUPPORT': {
                const problems = await CarProblem.find({});
                let matched = null; let maxScore = 0;
                const cleanMsg = cleanText(message);

                for (let p of problems) {
                    if (!p.symptoms) continue;
                    for (let s of p.symptoms) {
                        const score = stringSimilarity.compareTwoStrings(cleanMsg, cleanText(s));
                        if (score > maxScore) { maxScore = score; matched = p; }
                    }
                }

                if (maxScore > 0.18 && matched) {
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