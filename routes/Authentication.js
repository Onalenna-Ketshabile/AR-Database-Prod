const express = require("express");
const router = express.Router();
const { User, Sequelize } = require("../models");
const stringSimilarity = require("string-similarity");
const { Op } = require("sequelize");

router.post("/login", async (req, res) => {
    const { username, password } = req.body; // Assuming you're sending data in the request body
  
    try {
      // Find the user by username
      const user = await User.findOne({
        where: { username },
      });
  
     console.log("Uses Found: ", user);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
  
      // Compare the provided password with the stored password (plain text)
      if (password != user.Password) {
        console.log("Password UnMatched!");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      else{
        console.log("Password Matched!");
      }
  
        // Store user information in the session
        req.session.user = {
        userId: user.UserID,
        username: user.Username,
        // ... other user information you want to store
      };

   

      console.log("res cookie",res.cookie);
      console.log("Session user: ", req.session.user);

      // Authentication successful
      res.status(200).json({ message: "Authentication successful" });
  
    } catch (error) {
      console.error("Error during authentication:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get('/check-auth', (req, res) => {
    // Check if the user is authenticated
    const isAuthenticated = req.session.user ? true : true;
    console.log("sessions",req.session);
    console.log("cookie: ", req.cookies);
    res.json({ isAuthenticated });
  });


module.exports = router;
