'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('OtpCodes', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addIndex('OtpCodes', ['email'], {
      unique: true,
      name: 'otp_codes_email_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('OtpCodes', 'otp_codes_email_unique');

    await queryInterface.changeColumn('OtpCodes', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
