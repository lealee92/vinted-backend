const express = require("express");
const router = express.Router();

router.post("/offer/publish", async (req, res) => {
  try {
    res.json("Hello World");
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
