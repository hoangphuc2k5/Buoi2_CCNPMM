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
            from: `"He thong" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Ma OTP dat lai mat khau',
            html: `
                <h2>Ma OTP cua ban la:</h2>
                <h1 style="letter-spacing: 8px; color: #2563eb;">${otp}</h1>
                <p>Ma co hieu luc trong <b>5 phut</b>.</p>
            `,
        });
    } catch (e) {
        throw e;
    }
}

export { sendOtpEmail };
