
// Define and export a Sequelize model for the "Areas" (Cities) entity
module.exports = (sequelize, DataTypes) => {
    // Define the "Areas" model with attributes
    const Sections = sequelize.define("Section", {
      // Define the "AreaID" attribute as an auto-incrementing primary key of type INTEGER
      SectionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Define the "AreaName" attribute of type STRING, which cannot be null
      SectionName: {
        type: DataTypes.STRING(255), // Adjust the maximum length as needed
        allowNull: false
      },
      // Define the "RegionID" attribute of type INTEGER, which can be used as a foreign key
      RegionID: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
      tableName: 'Sections', // Specify the table name if it's different from the model name
    });
  
      // Define a foreign key association to the "Regions" table
      Sections.belongsTo(sequelize.models.Region, {
        foreignKey: 'RegionID',
        onDelete: 'CASCADE' // Adjust the deletion behavior as needed
      });
  
    // Return the "Areas" model definition
    return Sections;
  };
  