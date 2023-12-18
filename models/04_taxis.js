// Define and export a Sequelize model for the "Taxis" entity
module.exports = (sequelize, DataTypes) => {
    // Define the "Taxis" model with attributes
    const Taxis = sequelize.define("Taxi", {
      // Define the "TaxiID" attribute as an auto-incrementing primary key of type INTEGER
      TaxiID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Define the "LicensePlate" attribute of type STRING, with a maximum length of 20 characters
      LicensePlate: {
        type: DataTypes.STRING(20),
        allowNull: true // Adjust this based on your requirements
      },
      // Define the "CurrentLocation" attribute of type GEOMETRY for storing geospatial data (latitude and longitude)
      CurrentLocation: {
        type: DataTypes.GEOMETRY,
        allowNull: true // Adjust this based on your requirements
      },
      // Define the "Status" attribute as an ENUM with three possible values
      Status: {
        type: DataTypes.ENUM('Available', 'Booked', 'On Route'),
        allowNull: true // Adjust this based on your requirements
      },
      // Define the "RankID" attribute of type INTEGER, which can be used as a foreign key
      RankID: {
        type: DataTypes.INTEGER,
        allowNull: true // Adjust this based on your requirements
      }
    }, {
      timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
      tableName: 'Taxis', // Specify the table name if it's different from the model name
    });
  
    // Define a foreign key association to the "TaxiRanks" table
    Taxis.belongsTo(sequelize.models.TaxiRank, {
      foreignKey: 'RankID',
      onDelete: 'CASCADE' // Adjust the deletion behavior as needed
    });
  
    // Return the "Taxis" model definition
    return Taxis;
  };
  