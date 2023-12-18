const express = require("express");
const router = express.Router();
const { TaxiRank,Section,Region, Sequelize, sequelize } = require("../models");
const stringSimilarity = require("string-similarity");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  try {
    const listOfTaxiRanks = await TaxiRank.findAll(); // Correct the model name to `taxi_rank`
    res.json(listOfTaxiRanks);

  } catch (error) {
    console.error("Error fetching taxi ranks:", error);
    res.status(500).json({ error: "An error occurred while fetching taxi ranks." });
  }
});

router.get("/moreinfo", async (req, res) => {
  try {
    const listOfTaxiRanks = await TaxiRank.findAll({
      include: [
        {
          model: sequelize.models.Section, // Assuming your Section model is named Section
          attributes: ['SectionName'], // Specify the attributes you want to include
          include: [
            {
              model: sequelize.models.Region, // Assuming your Region model is named Region
              attributes: ['RegionName'], // Specify the attributes you want to include
            },
          ],
        },
      ],
    });
    
    res.json(listOfTaxiRanks);

  } catch (error) {
    console.error("Error fetching taxi ranks:", error);
    res.status(500).json({ error: "An error occurred while fetching taxi ranks." });
  }
});

router.get("/:name", async (req, res) => {
  const name = req.params.name;
  console.log("encoded name: ", name);
  const taxi_rank_obj = await TaxiRank
    .findOne({
      // do i really havee to the object here?

      where: {
        RankName: name,
      },
      logging: console.log("name:",name)
      
    })
    .then((taxi_rank_obj) => {
      if (!taxi_rank_obj) {
        res.send("Taxi rank not found. : ", name, "<-- that");
      } else {
        res.send(taxi_rank_obj.RankID+"");
      }
    })
    .catch((error) => {
      console.log("Error section");
      res.send(error);
    });
});

router.get("/bestmatch/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const taxi_ranks = await TaxiRank.findAll();

    let bestMatchTaxiRank = null;
    let bestMatchScore = 0;

    taxi_ranks.forEach((taxi_rank) => {
      const similarity = stringSimilarity.compareTwoStrings(name, taxi_rank.RankName);
      if (similarity > bestMatchScore) {
        bestMatchScore = similarity;
        bestMatchTaxiRank = taxi_rank;
      }
    });

    if (bestMatchScore >= 0.3) {
      res.send(bestMatchTaxiRank.RankID+"");
    } else {
      res.send("No similar taxi rank found for: " + name);
    }
  } catch (error) {
    console.log("Error section");
    res.send(error);
  }});



router.get("/0/:firstTaxiRank/:finalTaxiRank", async (req, res) => {
  const firstTaxiRank = req.params.firstTaxiRank;
  const finalTaxiRank = req.params.finalTaxiRank;

  const taxi_rank_obj = await taxi_rank
    .findAll()
    .then(async (taxi_ranks) => {
      let bestMatchTaxiRank = null;
      let bestMatchFinalTaxiRank = null;
      let bestMatchScore = 0;

      //Look for the origin

      taxi_ranks.forEach((taxi_rank) => {
        const similarity = stringSimilarity.compareTwoStrings(
          firstTaxiRank,
          taxi_rank.name
        );
        if (similarity > bestMatchScore) {
          bestMatchFirstTaxiRank = taxi_rank;
          bestMatchScore = similarity;
        }
      });

      console.log("Found Best Match First Rank: ", bestMatchFirstTaxiRank.name);

      //Now look for best match destination
      bestMatchScore = 0;

      taxi_ranks.forEach((taxi_rank) => {
        const similarity = stringSimilarity.compareTwoStrings(
          finalTaxiRank,
          taxi_rank.name
        );
        if (similarity > bestMatchScore) {
          bestMatchFinalTaxiRank = taxi_rank;
          bestMatchScore = similarity;
        }
      });

      console.log("Found Best Match Final Rank: ", bestMatchFinalTaxiRank.name);
      // res.send("works");
      if (bestMatchFirstTaxiRank && bestMatchFinalTaxiRank) {
        console.log("Doing the path search");
        let startId = bestMatchFirstTaxiRank.id;
        let endId = bestMatchFinalTaxiRank.id;
        let currentId = startId;
        let route = [startId];
        while (currentId !== endId) {
          console.log("Inside while loop");
          await taxi_rank_link
            .findOne({
              where: {
                [Op.or]: [
                  { taxi_rank1_id: currentId },
                  { taxi_rank2_id: currentId },
                ],
              },
            })
            .then((nextLink) => {
              console.log("Execution after getting a link");
              if (!nextLink) {
                console.log("No route found");
                res.send("No link!");
              }
              currentId =
                nextLink.taxi_rank1_id === currentId
                  ? nextLink.taxi_rank2_id
                  : nextLink.taxi_rank1_id;
              route.push(currentId);
              console.log("Something pushed: ", nextLink);
              res.send(nextLink);
            });
        }

        // return route;
        console.log("Found route: ", route);
        res.send(route);
      } else {
        res.status(404).send("No taxi rank found with that name.");
      }
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//Adding data to database
// Add a new taxi rank
router.post("/", async (req, res) => {
  const { RankName, Location, ContactDetails, SectionName, RegionID } = req.body;

  try {
    // Check if SectionName and RegionID are provided in the request body
    if (SectionName && RegionID) {
      // Check if the specified section exists
      let section = await Section.findOne({
        where: { SectionName, RegionID }
      });

      // If the section doesn't exist, create it
      if (!section) {
        section = await Section.create({
          SectionName,
          RegionID
        });
      }

      // Create a new taxi rank with SectionID
      const newTaxiRank = await TaxiRank.create({
        RankName,
        Location: Sequelize.fn('ST_GeomFromText', `POINT(${Location})`),
        ContactDetails,
        SectionID: section.SectionID
      });

      // Return the newly created taxi rank
      res.json(newTaxiRank);
    } else {
      // Create a new taxi rank without modifying SectionID
      const newTaxiRank = await TaxiRank.create({
        RankName,
        Location,
        ContactDetails
      });

      // Return the newly created taxi rank
      res.json(newTaxiRank);
    }
  } catch (error) {
    console.error("Error adding a new taxi rank:", error);
    res.status(500).json({ error: "An error occurred while adding a new taxi rank." });
  }
});

//Updating the database:
// Update taxi rank attributes in the database
const updateTaxiRankAttributes = async (taxiRankObj) => {
  try {
    const { RankID, ContactDetails, Section: { SectionName, Region: { RegionName } } } = taxiRankObj;

    // Find the existing taxi rank in the database
    const existingTaxiRank = await TaxiRank.findByPk(RankID, {
      include: [{ model: Section, attributes: ['SectionName', 'RegionID'] }]
    });

    if (!existingTaxiRank) {
      console.error(`Taxi rank with ID ${RankID} not found.`);
      return;
    }

    // Check if ContactDetails need to be updated
    if (ContactDetails !== undefined && ContactDetails !== existingTaxiRank.ContactDetails) {
      await existingTaxiRank.update({ ContactDetails });
      console.log(`Updated ContactDetails for taxi rank with ID ${RankID}`);
    }

    // Check if SectionName needs to be updated
    if (SectionName !== undefined && SectionName !== existingTaxiRank.Section?.SectionName) {
      // Check if the specified section exists
      let section = await Section.findOne({
        where: { SectionName, RegionID: existingTaxiRank.Section?.RegionID }
      });

      // If the section doesn't exist, create it along with its corresponding Region
      if (!section) {
        // Find or create the region using RegionName
        let region = await Region.findOne({
          where: { RegionName }
        });

        if (!region) {
          region = await Region.create({
            RegionName
          });
        }

        // Create the new section with the specified SectionName and RegionID
        section = await Section.create({
          SectionName,
          RegionID: region.RegionID
        });
      }

      // Update the taxi rank with the new SectionID
      await existingTaxiRank.update({ SectionID: section.SectionID });
      console.log(`Updated SectionName for taxi rank with ID ${RankID}`);
    }

    console.log(`Taxi rank with ID ${RankID} attributes updated successfully.`);
  } catch (error) {
    console.error("Error updating taxi rank attributes:", error);
  }
};

// Use this function in your route where you want to update the taxi rank attributes
router.put("/update", async (req, res) => {
  const taxiRankObjToUpdate = req.body;

  try {
    await updateTaxiRankAttributes(taxiRankObjToUpdate);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating taxi rank attributes:", error);
    res.status(500).json({ error: "An error occurred while updating the taxi rank attributes." });
  }
});
module.exports = router;
