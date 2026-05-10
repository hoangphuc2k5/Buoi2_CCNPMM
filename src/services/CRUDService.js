import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../models/index';
import { sendOtpEmail } from './emailService';
import { generateOtp } from '../utils/otpGenerator';

let handleForgotPassword = async (email, ip = 'unknown') => {
    try {
        let user = await db.User.findOne({ where: { email } });
        if (!user) return { found: false };

        let otp = generateOtp();
        let expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.OtpRequest.create({ email, ip });
        await db.OtpCode.upsert({ email, otp, expiresAt });
        await sendOtpEmail(email, otp);

        return { found: true };
    } catch (e) {
        console.error('handleForgotPassword error:', e);
        throw e;
    }
}

let handleResetPassword = async (email, otp, newPassword) => {
    try {
        let record = await db.OtpCode.findOne({
            where: {
                email,
                otp,
                expiresAt: { [Op.gt]: new Date() },
            }
        });

        if (!record) return { valid: false };

        let hashed = await bcrypt.hash(newPassword, 10);
        await db.User.update({ password: hashed }, { where: { email } });
        await db.OtpCode.destroy({ where: { email } });

        return { valid: true };
    } catch (e) {
        throw e;
    }
}

export default {
    handleForgotPassword,
    handleResetPassword,
}
