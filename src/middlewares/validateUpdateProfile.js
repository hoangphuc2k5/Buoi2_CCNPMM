const validateUpdateProfile = (req, res, next) => {
  try {
    const { name, phone, bio, email } = req.body;

    // Kiểm tra email không được để trống
    if (!email || email.trim() === "") {
      return res.render("profile", {
        user: req.user,
        message: "Email là bắt buộc.",
        success: false,
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("profile", {
        user: req.user,
        message: "Email không hợp lệ.",
        success: false,
      });
    }

    // Kiểm tra phone (nếu có) hợp lệ
    if (phone && phone.trim() !== "") {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone.replace(/[^\d]/g, ""))) {
        return res.render("profile", {
          user: req.user,
          message: "Số điện thoại không hợp lệ (10-11 chữ số).",
          success: false,
        });
      }
    }

    // Kiểm tra name độ dài
    if (name && name.length > 100) {
      return res.render("profile", {
        user: req.user,
        message: "Tên không được vượt quá 100 ký tự.",
        success: false,
      });
    }

    // Kiểm tra bio độ dài
    if (bio && bio.length > 500) {
      return res.render("profile", {
        user: req.user,
        message: "Tiểu sử không được vượt quá 500 ký tự.",
        success: false,
      });
    }

    next();
  } catch (error) {
    console.error("validateUpdateProfile error:", error);
    return res.render("profile", {
      user: req.user,
      message: "Lỗi validate dữ liệu.",
      success: false,
    });
  }
};

export default validateUpdateProfile;
