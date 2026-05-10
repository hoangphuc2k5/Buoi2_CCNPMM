'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OtpRequest extends Model {
    static associate(models) {
      // define association here
    }
  }
  OtpRequest.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OtpRequest',
  });
  return OtpRequest;
};
