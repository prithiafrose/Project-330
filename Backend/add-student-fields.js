//const sequelize = require("./config/db");

//async function addStudentProfileFields() {
  try {
    console.log("Adding student profile fields to users table...");

    // Add the new columns if they don't exist
    await sequelize.getQueryInterface().addColumn('users', 'full_name', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'skills', {
      type: sequelize.Sequelize.TEXT,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'education', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'experience', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'isActive', {
      type: sequelize.Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'resetPasswordToken', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'resetPasswordExpires', {
      type: sequelize.Sequelize.BIGINT,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('users', 'createdAt', {
      type: sequelize.Sequelize.DATE,
      defaultValue: sequelize.Sequelize.NOW,
    });

    console.log("Student profile fields added successfully!");
  } catch (error) {
    if (error.message.includes("already exists") || error.original?.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist, skipping...");
    } else {
      console.error("Error adding student profile fields:", error);
    }
  } finally {
    await sequelize.close();
  }
}

addStudentProfileFields();