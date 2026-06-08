import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import VehicleColor from '../models/VehicleColor.js';
import Inventory from '../models/Inventory.js';
import CarProblem from '../models/CarProblem.js';
import News from '../models/News.js';
import { processSemanticAI, cleanText } from '../nlpManager.js';

const chatMemory = {}; // Trạng thái hội thoại[cite: 3]

export const handleChatInteraction = async (req, res) => {
    try {
        const { message, userId = "default_user" } = req.body;
        if (!message) return res.status(400).json({ text: "Nội dung yêu cầu trống!" });

        const { intent, entities } = await processSemanticAI(userId, message);
        
        if (!chatMemory[userId]) {
            chatMemory[userId] = { modelName: null, variantName: null, color: null };
        }

        // Logic cập nhật bộ nhớ[cite: 3]
        if (entities.modelName) {
            chatMemory[userId].modelName = entities.modelName;
            chatMemory[userId].variantName = null; 
        }
        if (entities.variantName) chatMemory[userId].variantName = entities.variantName;
        if (entities.color) chatMemory[userId].color = entities.color;

        let variantQuery = {};
        if (chatMemory[userId].modelName) {
            const model = await VehicleModel.findOne({ name: { $regex: new RegExp(chatMemory[userId].modelName, "i") } }).lean();
            if (model) variantQuery.modelId = model._id;
            else chatMemory[userId].modelName = null;
        }
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
        switch (intent) {
            
            // 💡 LUỒNG TƯ VẤN NHU CẦU NGƯỜI DÙNG (MỚI BỔ SUNG)
            case 'REQUIREMENT_CONSULTING': {
                const msg = message.toLowerCase();
                if (msg.includes("phượt") || msg.includes("off-road") || msg.includes("địa hình")) {
                    reply = "Dạ, với nhu cầu phượt địa hình, em xin gợi ý Ford Ranger Raptor hoặc Everest với hệ thống treo chuyên dụng ạ. Anh/chị muốn xem báo giá bản nào không ạ?";
                } else if (msg.includes("gầm cao") || msg.includes("đi phố") || msg.includes("cuv")) {
                    reply = "Dạ, Ford Territory là lựa chọn tối ưu cho gầm cao đi phố, thiết kế hiện đại và rất tiết kiệm nhiên liệu. Anh/chị cần check thông số kỹ thuật em này không ạ?";
                } else {
                    reply = "Dạ, để tư vấn xe phù hợp nhất, anh/chị cho em biết mình ưu tiên đi gia đình, đi làm hay đi địa hình được không ạ?";
                }
                break;
            }

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

            // ℹ️ LUỒNG THÔNG SỐ KỸ THUẬT & TRANG BỊ CHUYÊN SÂU (MAPPED 100% TRƯỜNG DỮ LIỆU)
            case 'SPECS_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
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
                const variant = await Variant.findOne(variantQuery);
                if (!variant) {
                    reply = "Dạ, anh/chị vui lòng cho em biết rõ dòng xe hoặc phiên bản cụ thể để em kiểm tra tồn kho chính xác nhé!";
                    break;
                }

                const stockItems = await Inventory.find({ 
                    variantId: variant._id, 
                    status: "Trong kho" 
                }).populate({ path: 'colorId', select: 'name' });

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

            // 🎨 LUỒNG TRA CỨU DANH SÁCH MÀU NGOẠI THẤT
            case 'COLOR_QUERY': {

                console.log("ENTITIES:", entities);
                console.log("VARIANT QUERY:", variantQuery);

                const variant = await Variant.findOne(variantQuery)
                    .populate('modelId');

                console.log("FOUND VARIANT:", variant);

                if (!variant) {
                    reply = `🎨 Dữ liệu bảng màu phối của dòng xe này đang được cập nhật lại từ phòng thiết kế.`;
                    break;
                }

                const dbColors = await VehicleColor.find({
                    variantId: variant._id
                });

                console.log("COLORS:", dbColors);

                const names = dbColors.map(c => c.name).join(', ');

                reply =
                    `🎨 Màu hiện có: ${names}`;

                break;
            }

            // 🏦 HỖ TRỢ GIẢI PHÁP TÀI CHÍNH TRẢ GÓP NGÂN HÀNG
            case 'INSTALLMENT_QUERY': {
                const variant = await Variant.findOne(variantQuery).populate('modelId');
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