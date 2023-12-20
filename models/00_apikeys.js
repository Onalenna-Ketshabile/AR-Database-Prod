// models/APIKey.js
module.exports = (sequelize, DataTypes) => {
    const APIKey = sequelize.define('APIKey', {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Service_Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        API_KEY: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'API_Keys', // Specify the exact table name if different from the model name
        timestamps: true, // Add this line to enable timestamps
        createdAt: 'Created_At', // Specify the custom name for the createdAt column
        updatedAt: 'Updated_At', // Specify the custom name for the updatedAt column
    });

    return APIKey;
};
