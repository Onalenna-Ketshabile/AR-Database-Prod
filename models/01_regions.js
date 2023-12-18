// Define and export a Sequelize model for the "Regions" entity
module.exports = (sequelize, DataTypes) => {
    // Define the "Regions" model with attributes
    const Regions = sequelize.define("Region", {
      // Define the "RegionID" attribute as an auto-incrementing primary key of type INTEGER
      RegionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Define the "RegionName" attribute of type STRING, which cannot be null
      RegionName: {
        type: DataTypes.STRING(255), // Adjust the maximum length as needed
        allowNull: false
      },
      // Define the "Abbreviation" attribute of type STRING, which can be null
      Abbreviation: {
        type: DataTypes.STRING(255), // Adjust the maximum length as needed
        allowNull: true
      }
    }, {
      timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
      tableName: 'Regions', // Specify the table name if it's different from the model name
    });
  
    // Return the "Regions" model definition
    return Regions;
  };
  