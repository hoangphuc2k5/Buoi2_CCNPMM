import registerService from '../services/registerService';

const register = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.ip
      || req.connection?.remoteAddress
      || 'unknown';

    const result = await registerService.handleRegister(req.body, ip);
    return res.status(result.statusCode).json(result.response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Loi server.',
    });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await registerService.handleVerifyRegisterOtp(email, otp);
    return res.status(result.statusCode).json(result.response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Loi server.',
    });
  }
};

export default { register, verifyRegisterOtp };
