import bvo from '@getbrevo/brevo';

const sendVerifyEmail = async (userEmail, verifyToken) => {
    let defaultClient = bvo.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Lấy từ Environment trên Render

    let apiInstance = new bvo.TransactionalEmailsApi();
    let sendSmtpEmail = new bvo.SendSmtpEmail();

    // Link dẫn tới trang xác thực ở Frontend của bạn
    const verifyUrl = `https://ford-admin-mu.vercel.app/verify-email?token=${verifyToken}`;

    sendSmtpEmail = {
        sender: { email: process.env.EMAIL_SENDER, name: "Ford Quế Võ Admin" },
        to: [{ email: userEmail }],
        subject: "Xác thực tài khoản Admin của bạn",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #003399;">Chào mừng bạn đến với hệ thống Ford Quế Võ!</h2>
                <p>Bạn nhận được email này vì đã đăng ký tài khoản quản trị. Vui lòng nhấn vào nút bên dưới để xác thực email:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #003399; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">XÁC THỰC NGAY</a>
                </div>
                <p style="font-size: 12px; color: #777;">Nếu nút trên không hoạt động, bạn có thể copy link này: ${verifyUrl}</p>
            </div>
        `
    };

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email đã gửi tới: ${userEmail}`);
    } catch (error) {
        console.error("❌ Lỗi gửi email Brevo:", error);
        throw error;
    }
};

export default sendVerifyEmail;