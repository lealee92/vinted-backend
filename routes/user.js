const express = require("express");
const router = express.Router(); // pour séparer le code source en plusieurs fichiers

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

// import des models (ex: faire des recherches dans les collections si besoin)
const User = require("../models/User");

cloudinary.config({
  cloud_name: "dzo87dcws",
  api_key: "574745914227143",
  api_secret: "Lt0hqS8fGRlMuLLa5UDZq1hq5vI",
});

router.post("/user/signup", async (req, res) => {
  const { email, password, username, newsletter } = req.fields;
  try {
    // Recherche dans la BDD. Est-ce qu'un utilisateur possède cet email ?
    const user = await User.findOne({ email: email });

    // Si oui, on renvoie un message et on ne procède pas à l'inscription
    if (user) {
      res.status(409).json({ message: "This email already has an account" });

      // sinon, on passe à la suite...
    } else {
      // l'utilisateur a-t-il bien envoyé les informations requises ?
      if (email && password && username) {
        const token = uid2(64);

        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        // Étape 2 : créer le nouvel utilisateur
        const newUser = new User({
          email: email,

          account: {
            username: username,
          },
          newsletter: newsletter,
          salt: salt,
          hash: hash,
          token: token,
        });

        await newUser.save();
        console.log(req.files.picture.path);
        const picture = await cloudinary.uploader.upload(
          req.files.picture.path,
          { folder: `vinted/profiles/${newUser._id}` }
        );
        newUser.account.avatar = picture;
        await newUser.save();

        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        // l'utilisateur n'a pas envoyé les informations requises ?
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  const { email, password } = req.fields;
  const isUser = await User.findOne({ email: email });

  try {
    if (isUser) {
      const hashToCheck = SHA256(password + isUser.salt).toString(encBase64);
      if (hashToCheck === isUser.hash) {
        res.status(200).json({
          _id: isUser._id,
          email: isUser.email,
          token: isUser.token,
          account: isUser.account,
        });
      } else {
        res.status(401).json({ message: "unauthorized" });
      }
      // vérifier que le mdp est le bon
      // password rentré par le user
      console.log(isUser);
    } else {
      res.status(401).json({ message: "unauthorized" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
