const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js");

// import des models (ex: faire des recherches dans les collections si besoin)
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  const { username, email, password, phone } = req.fields;
  try {
    // est ce quil y a déjà un user qui possède l'email que je recois ?
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(409).json({ message: "L'email existe déjà" });
    } else {
      if (email && password && username) {
        // encrypter le mdp,
        // générer un token (chaine de caractères aléatoire)
        const token = uid2(64);
        const salt = uid2(64); // pour encrypter le mdp
        const hash = SHA256(password + salt).toString(encBase64);

        // créer un nv user
        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        // sauvegarder ce user dans la bdd
        await newUser.save();
        // répondre au client
        res.status(200).json(newUser);
      } else {
        res.status(400).json({ message: "missing parameters" });
      }
    }

    // si oui, on renvoie un message et on ne procède pas à l'inscription
    // sinon, on peut créer un nouveau user
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", (req, res) => {
  res.json("Hello");
});
module.exports = router;
