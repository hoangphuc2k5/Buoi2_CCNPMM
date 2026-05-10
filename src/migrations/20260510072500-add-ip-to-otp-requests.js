'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OtpRequests', 'ip', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'unknown',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('OtpRequests', 'ip');
  }
};
