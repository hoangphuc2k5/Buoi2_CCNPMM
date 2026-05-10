import { Op } from 'sequelize';
import db from '../models/index.js';

const preventRapidRegisterOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.ip
      || req.connection?.remoteAddress
      || 'unknown';

    if (!email) {
      return next();
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - 10 * 60 * 1000);

    const emailCount = await db.OtpRequest.count({
      where: {
        email,
        createdAt: { [Op.gte]: windowStart },
      },
    });

    if (emailCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Email nay da yeu cau OTP qua 3 lan trong 10 phut.',
      });
    }

    const ipCount = await db.OtpRequest.count({
      where: {
        ip,
        createdAt: { [Op.gte]: windowStart },
      },
    });

    if (ipCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'IP nay da yeu cau OTP qua 3 lan trong 10 phut.',
      });
    }

    const existingOtp = await db.OtpCode.findOne({
      where: {
        email,
        expiresAt: { [Op.gt]: now },
      },
    });

    if (existingOtp) {
      return res.status(429).json({
        success: false,
        message: 'OTP van con hieu luc. Vui long kiem tra email de kich hoat tai khoan.',
      });
    }

    next();
  } catch (error) {
    console.error('preventRapidRegisterOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Loi server.',
    });
  }
};

export default preventRapidRegisterOtp;
