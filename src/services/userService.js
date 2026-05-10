const { User } = require("../models");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const updateProfile = (userId, payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return reject(createError(404, "User not found"));
      }

      const allowed = {
        fullName: payload.fullName,
        phone: payload.phone,
        bio: payload.bio
      };

      await user.update(allowed);

      return resolve({
        message: "Profile updated",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          bio: user.bio
        }
      });
    } catch (error) {
      return reject(error);
    }
  });

module.exports = { updateProfile };
