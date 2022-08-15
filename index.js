const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const app = express();
app.use(formidable());

mongoose.connect("mongodb://localhost/vinted");

const usersRoutes = require("./routes/user");
app.use(usersRoutes);

const offersRoutes = require("./routes/offer");
app.use(offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "cette route n'existe pas" });
});

app.listen(3000, () => {
  console.log("Server has started !!");
});
