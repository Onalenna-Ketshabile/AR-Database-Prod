const express = require("express");
const router = express.Router();
const { Route,TaxiRank, Sequelize } = require("../models");
const stringSimilarity = require("string-similarity");
const { Op } = require("sequelize");
const axios = require('axios');

const API_KEY = "AIzaSyCTVLjYNpFVtv79ES8PLgHoWsOtJ_eyuhc";

// Define the association between Route and TaxiRank
Route.belongsTo(TaxiRank, {
    foreignKey: 'TaxiRankTwoID',
    as: 'TaxiRankTwo', // Alias for the association
  });

const findPaths = async (startTaxiRankID, endTaxiRankID, currentPath = [], visited = new Set()) => {
    if (visited.has(startTaxiRankID)) {
        return [];
    }

    visited.add(startTaxiRankID);

    const routes = await Route.findAll({
        where: { TaxiRankOneID: startTaxiRankID },
        attributes: ['RouteID', 'TaxiRankTwoID']
    });

    const paths = [];

    for (const route of routes) {
        const nextTaxiRankID = route.TaxiRankTwoID;

        if (nextTaxiRankID === endTaxiRankID) {
            // Found a path to the destination
            paths.push([...currentPath, startTaxiRankID, endTaxiRankID]);
        } else {
            const nextPaths = await findPaths(nextTaxiRankID, endTaxiRankID, [...currentPath, startTaxiRankID], visited);
            paths.push(...nextPaths);
        }
    }

    visited.delete(startTaxiRankID);

    return paths;
};

router.get("/:start/:end", async (req, res) => {
    try {
        const startTaxiRankID = parseInt(req.params.start);
        const endTaxiRankID = parseInt(req.params.end);

        const paths = await findPaths(startTaxiRankID, endTaxiRankID);

        res.json({ paths });

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/cost/:start/:end", async (req, res) => {
    try {
        const startTaxiRank = parseInt(req.params.start);
        const endTaxiRank = parseInt(req.params.end);

        // Assuming you have a Sequelize model named 'Route'
        const pairCost = await Route.findOne({
            where: {
                TaxiRankOneID: startTaxiRank,
                TaxiRankTwoID: endTaxiRank,
            },
            attributes: ['Fare'],
        });

        if (pairCost) {
            res.json(pairCost.Fare);
        } else {
            res.status(404).json({ error: 'Cost not found for the given taxi ranks' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/withprices/:start/:end", async (req, res) => {
    try {
        const startTaxiRankID = parseInt(req.params.start);
        const endTaxiRankID = parseInt(req.params.end);

        const paths = await findPaths(startTaxiRankID, endTaxiRankID);

        // Construct an object that includes the price information for each path
        const pathsWithPrices = await Promise.all(paths.map(async (path) => {
            let totalPrice = 0;
            const pathInfo = [];

            for (let i = 0; i < path.length - 1; i++) {
                const startNode = path[i];
                const endNode = path[i + 1];

                const route = await Route.findOne({
                    where: { TaxiRankOneID: startNode, TaxiRankTwoID: endNode },
                    // attributes: ['RouteID'],
                    // include: [{ model: Fare, attributes: ['Fare'] }]
                });
                
                const price = route ? route.Fare : 0;

                const startTaxiRank = await TaxiRank.findOne({
                    where: { RankID : startNode },
                    // attributes: ['RouteID'],
                    // include: [{ model: Fare, attributes: ['Fare'] }]
                });

                
                const startTR = startTaxiRank ? startTaxiRank.RankName : "name not found";
                const startLocation = startTaxiRank ? startTaxiRank.Location : "location not found";

                const endTaxiRank = await TaxiRank.findOne({
                    where: { RankID: endNode },
                    // attributes: ['RouteID'],
                    // include: [{ model: Fare, attributes: ['Fare'] }]
                });

                const endTR = endTaxiRank ? endTaxiRank.RankName : "name not found";
                const endLocation = endTaxiRank ? endTaxiRank.Location : "location not found";

                pathInfo.push({
                    start: startTR,
                    startLocation: startLocation,
                    end: endTR,
                    endLocation: endLocation,
                    price: price,
                });

                totalPrice += parseInt(price, 10);
            }

            return {
                path: pathInfo,
                totalPrice: totalPrice,
            };
        }));

        // Sort the result by totalPrice in ascending order
        const sortedPaths = pathsWithPrices.sort((a, b) => a.totalPrice - b.totalPrice);

        res.json({ sortedPaths });

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





router.get("/", async (req, res) => {
  console.log('inside');
  try {
    const listOfTaxiRanks = await Route.findAll(); // 
    console.log('routes:', listOfTaxiRanks);
    res.json(listOfTaxiRanks);

  } catch (error) {
    console.error("Error fetching taxi ranks:", error);
    res.status(500).json({ error: "An error occurred while fetching taxi ranks." });
  }
});

router.get('/:taxiRankOneID', async (req, res) => {
    const taxiRankOneIDParam = req.params.taxiRankOneID;

    try {
      const routes = await Route.findAll({
        where: {
          TaxiRankOneID: taxiRankOneIDParam,
        },
        include: [
          {
            model: TaxiRank,
            as: 'TaxiRankTwo', // Alias for the joined TaxiRank model
            attributes: ['RankID', 'RankName'], // Select specific attributes to include
            where: {
              RankID: Sequelize.col('Route.TaxiRankTwoID'), // Join condition
            },
          },
        ],
      });
  
      res.json(routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



router.get('/nearby/:latitude/:longitude', async (req, res) => {
    try {
       
        const latitude = req.params.latitude;
        const longitude = req.params.longitude;
    
        const transitStationResults = await getNearbyPlaces(latitude, longitude, 'transit_station');
        const taxiStandResults = await getNearbyPlaces(latitude, longitude, 'taxi_stand');
    
        const combinedResults = combineResults(transitStationResults, taxiStandResults, latitude, longitude);
    
        res.json(combinedResults);
      } catch (error) {
        console.error('Error fetching nearby places:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });
  
// Helper function to fetch nearby places
const getNearbyPlaces = async (latitude, longitude, type) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&keyword=taxi%20rank&rankby=distance&type=${type}&key=${API_KEY}`;
    
    try {
      const response = await axios.get(url);
      return response.data.results.slice(0, 20); // Take the first 20 results
    } catch (error) {
      console.error(`Error fetching nearby ${type} places:`, error);
      throw error;
    }
  };
  
  // Helper function to combine and sort results
  const combineResults = (transitStationResults, taxiStandResults, latitude, longitude) => {
    // Combine the arrays
    const combinedResults = [...transitStationResults, ...taxiStandResults];
  
    // Sort the combined results by distance using the Haversine formula
    combinedResults.sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.geometry.location.lat, a.geometry.location.lng);
      const distanceB = calculateDistance(latitude, longitude, b.geometry.location.lat, b.geometry.location.lng);
  
      return distanceA - distanceB;
    });
  
    // Take the first 10 sorted results
    return combinedResults;
  };
  
  // Helper function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };
  
  // Helper function to convert degrees to radians
  const deg2rad = (deg) => deg * (Math.PI / 180);


  // Update the database:
  router.put("/update-fare", async (req, res) => {
    try {
      const { RouteID, Fare } = req.body;
  
      // Find the route by RouteID
      const route = await Route.findByPk(RouteID);
  
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
  
      // Update the Fare value
      await route.update({ Fare });
  
      return res.json({ success: true, message: `Fare updated for RouteID: ${RouteID}` });
    } catch (error) {
      console.error("Error updating Fare:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Create a new route
router.post("/add-route", async (req, res) => {
  try {
    // Extract data from the request body
    const { TaxiRankOneID, TaxiRankTwoID, Fare } = req.body;

    // Validate if required fields are present
    if (!TaxiRankOneID || !TaxiRankTwoID || !Fare) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the route already exists
    const existingRoute = await Route.findOne({
      where: {
        TaxiRankOneID,
        TaxiRankTwoID,
      },
    });

    if (existingRoute) {
      return res.status(409).json({ error: "Route already exists" });
    }

    // Create a new route
    const newRoute = await Route.create({
      TaxiRankOneID,
      TaxiRankTwoID,
      Fare,
    });

    return res.status(201).json({ success: true, route: newRoute });
  } catch (error) {
    console.error("Error adding route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
