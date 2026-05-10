import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

let sendOtpEmail = async (toEmail, otp) => {
    try {
        await transporter.sendMail({
            from: `"Hệ thống" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Mã OTP đặt lại mật khẩu',
            html: `
                <h2>Mã OTP của bạn là:</h2>
                <h1 style="letter-spacing: 8px; color: #2563eb;">${otp}</h1>
                <p>Mã có hiệu lực trong <b>5 phút</b>.</p>
            `,
        });
    } catch (e) {
        throw e;
    }
}

export { sendOtpEmail };