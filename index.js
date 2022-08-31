require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidable());
app.use(cors());

cloudinary.config({
  cloud_name: "dzo87dcws",
  api_key: "process.env.CLOUDINARY_API_KEY",
  api_secret: "process.env.CLOUDINARY_API_SECRET",
});

mongoose.connect(process.env.MONGODB_URI);
console.log(process.env.MONGODB_URI);

const usersRoutes = require("./routes/user");
app.use(usersRoutes);

const offersRoutes = require("./routes/offer");
app.use(offersRoutes);

// pour gérer les pages introuvables,

app.all("*", (req, res) => {
  res.status(404).json({ message: "cette route n'existe pas" });
});

// pour écouter les requêtes du port 3000
app.listen(process.env.PORT, () => {
  console.log("Server has started !!");
});
