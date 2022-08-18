const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dzo87dcws",
  api_key: "574745914227143",
  api_secret: "Lt0hqS8fGRlMuLLa5UDZq1hq5vI",
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // console.log(req.user); //une clé req = pour lier chaque offre à l'user qui la poste
  try {
    // console.log(req.fields);
    // console.log(req.files.picture.path);
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

    // créer une nouvelle annonce (sans image)
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });
    // console.log(newOffer);
    // envoi de l'image à cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    // ajout result à product_image
    newOffer.product_image = result;
    // sauvegarder l'annonce
    await newOffer.save();
    res.json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      owner: {
        account: newOffer.owner.account,
        _id: newOffer.owner._id,
      },
      product_image: newOffer.product_image,
    });
    // console.log(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
