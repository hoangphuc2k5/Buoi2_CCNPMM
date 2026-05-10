const userService = require("../services/userService");

const getProfile = async (req, res, next) => {
  try {
    const result = await userService.getProfile(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProfile, updateProfile };
