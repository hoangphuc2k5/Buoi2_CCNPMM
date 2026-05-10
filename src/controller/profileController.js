import db from "../models/index.js";

const viewProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect("/forgot-password?message=Người dùng không tồn tại");
    }

    return res.render("profile", {
      user: user,
      message: null,
      success: null,
    });
  } catch (error) {
    console.error("viewProfile error:", error);
    return res.render("profile", {
      user: req.user || {},
      message: "Lỗi server.",
      success: false,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, name, phone, bio } = req.body;
    const currentEmail = req.userEmail;

    // Kiểm tra xem email mới đã tồn tại chưa (nếu email thay đổi)
    if (email !== currentEmail) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.render("profile", {
          user: req.user,
          message: "Email này đã được sử dụng.",
          success: false,
        });
      }
    }

    // Cập nhật thông tin profile
    await db.User.update(
      {
        email: email,
        name: name || req.user.name,
        phone: phone || req.user.phone,
        bio: bio || req.user.bio,
      },
      { where: { email: currentEmail } },
    );

    // Lấy user đã update
    const updatedUser = await db.User.findOne({ where: { email } });

    // Update req.user và req.userEmail
    req.user = updatedUser;
    req.userEmail = email;

    return res.render("profile", {
      user: updatedUser,
      message: "Cập nhật hồ sơ thành công.",
      success: true,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.render("profile", {
      user: req.user,
      message: "Lỗi server.",
      success: false,
    });
  }
};

export default {
  viewProfile,
  updateProfile,
};
