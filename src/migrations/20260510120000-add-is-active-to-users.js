'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', 'users_email_unique');
    await queryInterface.removeColumn('Users', 'isActive');

    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
