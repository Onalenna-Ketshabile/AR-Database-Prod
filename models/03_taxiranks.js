// Define and export a Sequelize model for the "TaxiRanks" entity
module.exports = (sequelize, DataTypes) => {
  // Define the "TaxiRanks" model with attributes
  const TaxiRanks = sequelize.define("TaxiRank", {
    // Define the "RankID" attribute as an auto-incrementing primary key of type INTEGER
    RankID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Define the "RankName" attribute of type STRING, which cannot be null
    RankName: {
      type: DataTypes.STRING(255), // Adjust the maximum length as needed
      allowNull: false
    },
    // Define the "Location" attribute of type GEOMETRY for storing geospatial data (latitude and longitude)
    Location: {
      type:  DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    // Define the "ContactDetails" attribute of type STRING, which can be null
    ContactDetails: {
      type: DataTypes.STRING(255), // Adjust the maximum length as needed
      allowNull: true
    },
    // Define the "SectionID" attribute of type INTEGER, which can be used as a foreign key
    SectionID: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
    tableName: 'TaxiRanks', // Specify the table name if it's different from the model name
  });

  // Define a foreign key association to the "Sections" table
  TaxiRanks.belongsTo(sequelize.models.Section, {
    foreignKey: 'SectionID',
    onDelete: 'CASCADE', // Adjust the deletion behavior as needed
    constraints: false, // Disable constraints to avoid conflicts
  });

  // Return the "TaxiRanks" model definition
  return TaxiRanks;
};
