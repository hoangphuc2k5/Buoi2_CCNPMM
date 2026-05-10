import db from "../models/index.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    // Support query/body/session and JWT cookie for web login flow.
    let userId = req.query?.userId || req.body?.userId || req.session?.userId;
    let email = req.query?.email || req.body?.email || req.session?.email;

    if (!userId && !email) {
      const accessToken = req.cookies?.accessToken;
      if (accessToken && process.env.ACCESS_TOKEN_SECRET) {
        try {
          const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
          userId = payload?.userId || userId;
          email = payload?.email || email;
        } catch (tokenError) {
          console.warn("Invalid access token:", tokenError.message);
        }
      }
    }

    if (!email && !userId) {
      return res.redirect("/login?message=Vui%20long%20dang%20nhap%20de%20tiep%20tuc&success=false");
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
    return res.redirect("/login?message=Loi%20xac%20thuc&success=false");
  }
};

export default authMiddleware;
