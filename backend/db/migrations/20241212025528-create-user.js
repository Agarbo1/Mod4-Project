"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        username: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING(256),
          allowNull: false,
          unique: true,
        },
        hashedPassword: {
          type: Sequelize.STRING.BINARY,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    await queryInterface.removeConstraint("hobbit_hole_schema.Reviews", "Reviews_userId_fkey")
    await queryInterface.removeConstraint("hobbit_hole_schema.Bookings", "Bookings_userId_fkey")
    await queryInterface.removeConstraint("hobbit_hole_schema.Spots", "Spots_ownerId_fkey")
    return queryInterface.dropTable(options);
  },
};
