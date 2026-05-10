import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../models/index';
import { generateOtp } from '../utils/otpGenerator';
import { sendRegisterOtpEmail } from './registerEmailService';

let handleRegister = async (data, ip = 'unknown') => {
    try {
        let { email, password } = data;
        let user = await db.User.findOne({ where: { email } });

        if (user && user.isActive) {
            return {
                statusCode: 409,
                response: {
                    success: false,
                    message: 'Email da ton tai.',
                }
            };
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            await db.User.update(
                { password: hashedPassword, isActive: false },
                { where: { email } }
            );
        } else {
            await db.User.create({
                email,
                password: hashedPassword,
                isActive: false,
            });
        }

        let otp = generateOtp();
        let expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.OtpRequest.create({ email, ip });
        await db.OtpCode.upsert({ email, otp, expiresAt });
        await sendRegisterOtpEmail(email, otp);

        return {
            statusCode: 200,
            response: {
                success: true,
                message: 'Dang ky thanh cong. Vui long kiem tra email de nhan OTP kich hoat.',
            }
        };
    } catch (e) {
        console.error('handleRegister error:', e);
        throw e;
    }
}

let handleVerifyRegisterOtp = async (email, otp) => {
    try {
        let record = await db.OtpCode.findOne({
            where: {
                email,
                otp,
                expiresAt: { [Op.gt]: new Date() },
            }
        });

        if (!record) {
            return {
                statusCode: 400,
                response: {
                    success: false,
                    message: 'OTP khong hop le hoac da het han.',
                }
            };
        }

        let user = await db.User.findOne({ where: { email } });

        if (!user) {
            return {
                statusCode: 404,
                response: {
                    success: false,
                    message: 'Tai khoan khong ton tai.',
                }
            };
        }

        await db.User.update({ isActive: true }, { where: { email } });
        await db.OtpCode.destroy({ where: { email } });

        return {
            statusCode: 200,
            response: {
                success: true,
                message: 'Kich hoat tai khoan thanh cong.',
            }
        };
    } catch (e) {
        throw e;
    }
}

export default {
    handleRegister,
    handleVerifyRegisterOtp,
}
