// Define and export a Sequelize model for the "Routes" entity
module.exports = (sequelize, DataTypes) => {
    // Define the "Routes" model with attributes
    const Routes = sequelize.define("Route", {
      // Define the "RouteID" attribute as an auto-incrementing primary key of type INTEGER
      RouteID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TaxiRankOneID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TaxiRankTwoID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Fare: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    }
      // Define the "StartRankID" attribute of type INTEGER, which can be used as a foreign key
    }, {
      timestamps: false, // Set to true if you want to include timestamps (created_at and updated_at) in the table
      tableName: 'Routes', // Specify the table name if it's different from the model name
        uniqueCombination: function () {
          return sequelize.models.Routes.findOne({
              where: {
                  TaxiRankOneID: this.TaxiRankOneID,
                  TaxiRankTwoID: this.TaxiRankTwoID
              }
          }).then((route) => {
              if (route) {
                  throw new Error('The combination of TaxiRankOneID and TaxiRankTwoID must be unique.');
              }
          }); 
          }
    });
  
    // Define foreign key associations to the "TaxiRanks" table for StartRankID and EndRankID
    Routes.belongsTo(sequelize.models.TaxiRank, {
      foreignKey: 'TaxiRankOneID',
      onDelete: 'CASCADE' // Adjust the deletion behavior as needed
    });
    Routes.belongsTo(sequelize.models.TaxiRank, {
      foreignKey: 'TaxiRankTwoID',
      onDelete: 'CASCADE' // Adjust the deletion behavior as needed
    });
  
    // Return the "Routes" model definition
    return Routes;
  };
  