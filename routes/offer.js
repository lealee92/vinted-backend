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

router.get("/offers", async (req, res) => {
  // console.log(req.query);
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let page;
    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = Number(req.query.limit);

    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .skip((page - 1) * limit) // ignorer les x résultats
      .limit(limit); // renvoyer y résultats

    res.json({
      count: count,
      offers: offers,
    });

    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route qui permmet de récupérer les informations d'une offre en fonction de son id
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
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
