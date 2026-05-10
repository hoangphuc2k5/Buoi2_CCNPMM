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

let sendRegisterOtpEmail = async (toEmail, otp) => {
    try {
        await transporter.sendMail({
            from: `"He thong" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Ma OTP kich hoat tai khoan',
            html: `
                <h2>Ma OTP kich hoat tai khoan cua ban la:</h2>
                <h1 style="letter-spacing: 8px; color: #2563eb;">${otp}</h1>
                <p>Ma co hieu luc trong <b>5 phut</b>.</p>
            `,
        });
    } catch (e) {
        throw e;
    }
}

export { sendRegisterOtpEmail };
