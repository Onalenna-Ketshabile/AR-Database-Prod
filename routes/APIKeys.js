// routes/APIKeys.js
const express = require('express');
const router = express.Router();
const { APIKey } = require('../models');  // Import the APIKey mode

router.get('/', async (req, res) => {
    console.log('Before findOne');
  try {
    // Retrieve the API key from the database
    const apiKeyRecord = await APIKey.findOne({
      where: { Service_Name: 'Google Maps API' },
    });

    if (!apiKeyRecord) {
      throw new Error('API key not found in the database');
    }

    const apiKey = apiKeyRecord.API_KEY;

    // Use the API key in your logic here...

    res.status(200).json({ apiKey, message: 'API Key retrieved successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
