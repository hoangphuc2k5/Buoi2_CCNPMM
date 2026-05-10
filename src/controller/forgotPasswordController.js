import CRUDService from '../services/CRUDService';

let forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        let ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
        let result = await CRUDService.handleForgotPassword(email, ip);

        if (!result.found) {
            return res.render('forgotPassword', {
                message: 'Email không tồn tại trong hệ thống.',
                success: false,
            });
        }

        return res.redirect(`/reset-password?email=${encodeURIComponent(email)}&message=${encodeURIComponent('Mã OTP đã được gửi. Vui lòng kiểm tra email.')}&success=true`);
    } catch (e) {
        return res.render('forgotPassword', {
            message: 'Lỗi server.',
            success: false,
        });
    }
}

let resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        let result = await CRUDService.handleResetPassword(email, otp, newPassword);

        if (!result.valid) {
            return res.render('resetPassword', {
                message: 'OTP không hợp lệ hoặc đã hết hạn.',
                success: false,
                email: email,
            });
        }

        return res.render('resetPassword', {
            message: 'Đổi mật khẩu thành công.',
            success: true,
            email: email,
        });
    } catch (e) {
        return res.render('resetPassword', {
            message: 'Lỗi server.',
            success: false,
            email: '',
        });
    }
}

export default { forgotPassword, resetPassword }