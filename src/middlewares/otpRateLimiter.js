import { Op } from 'sequelize';
import db from '../models/index.js';

const preventRapidOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
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
      return res.redirect(`/forgot-password?email=${encodeURIComponent(email)}&message=${encodeURIComponent('Email này đã gửi quá 3 mã OTP trong 10 phút. Vui lòng thử lại sau.')}&success=false`);
    }

    const ipCount = await db.OtpRequest.count({
      where: {
        ip,
        createdAt: { [Op.gte]: windowStart },
      },
    });

    if (ipCount >= 3) {
      return res.redirect(`/forgot-password?email=${encodeURIComponent(email)}&message=${encodeURIComponent('Đã gửi quá nhiều yêu cầu OTP từ IP này trong 10 phút. Vui lòng thử lại sau.')}&success=false`);
    }

    const existingOtp = await db.OtpCode.findOne({
      where: {
        email,
        expiresAt: { [Op.gt]: now },
      },
    });

    if (existingOtp) {
      return res.redirect(`/reset-password?email=${encodeURIComponent(email)}&message=${encodeURIComponent('OTP đã được gửi. Vui lòng kiểm tra email hoặc nhập mã để đặt lại mật khẩu.')}&success=false`);
    }

    next();
  } catch (error) {
    console.error('preventRapidOtp error:', error);
    next(error);
  }
};

export default preventRapidOtp;
