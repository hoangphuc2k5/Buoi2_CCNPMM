import db from "../models/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Kiểm tra userId trong session hoặc từ query/body (tuỳ vào cách bạn quản lý session)
    // Hiện tại sử dụng email từ query param hoặc session
    const userId = req.query.userId || req.body.userId || req.session?.userId;
    const email = req.query.email || req.body.email || req.session?.email;

    if (!email && !userId) {
      return res.redirect(
        "/forgot-password?message=Vui lòng đăng nhập để tiếp tục",
      );
    }

    // Kiểm tra user có tồn tại
    let user;
    if (userId) {
      user = await db.User.findByPk(userId);
    } else if (email) {
      user = await db.User.findOne({ where: { email } });
    }

    if (!user) {
      return res.redirect("/forgot-password?message=Người dùng không tồn tại");
    }

    // Lưu user info vào req để dùng ở controller
    req.user = user;
    req.userEmail = email || user.email;

    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.redirect("/forgot-password?message=Lỗi xác thực");
  }
};

export default authMiddleware;
