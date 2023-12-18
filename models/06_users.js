// Define and export a Sequelize model for the "Users" entity
module.exports = (sequelize, DataTypes) => {
    // Define the "Users" model with attributes
    const Users = sequelize.define("User", {
      // Define the "UserID" attribute as an auto-incrementing primary key of type INTEGER
      UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Define the "Username" attribute of type STRING with a maximum length of 50 characters, and set it as unique
      Username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false // Adjust this based on your requirements
      },
      // Define the "Password" attribute of type STRING with a maximum length of 255 characters
      Password: {
        type: DataTypes.STRING(255),
        allowNull: false // Adjust this based on your requirements
      },
      // Define the "Email" attribute of type STRING with a maximum length of 100 characters
      Email: {
        type: DataTypes.STRING(100),
        allowNull: true // Adjust this based on your requirements
      },
      // Define the "FirstName" attribute of type STRING with a maximum length of 50 characters
      FirstName: {
        type: DataTypes.STRING(50),
        allowNull: true // Adjust this based on your requirements
      },
      // Define the "LastName" attribute of type STRING with a maximum length of 50 characters
      LastName: {
        type: DataTypes.STRING(50),
        allowNull: true // Adjust this based on your requirements
      }
    }, {
      timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
      tableName: 'Users', // Specify the table name if it's different from the model name
    });
  
    // Return the "Users" model definition
    return Users;
  };
  