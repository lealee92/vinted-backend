const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // req.headers.authorization;
  // console.log(req.headers);
  if (req.headers.authorization) {
    // faire la suite
    const token = req.headers.authorization.replace("Bearer ", ""); // aussi pr la requête axios
    console.log(token);
    // chercher dans la BDD le user qui possède ce token
    const user = await User.findOne({ token: token });
    // console.log(user);
    if (user) {
      // j'ajoute une clé user à l'objet req, contenant les infos du user
      req.user = user;
      return next(); // on peut passer à la suite
    } else {
      return res.status(401).json({ message: "Unauthorized 1" }); // return pour bien sortir de la fonction
    }
  } else {
    return res.status(401).json({ message: "Unauthorized 2" });
  }
};
//  {
//     const token = req.headers.authorization.replace("Bearer ", "");
//     console.log(token);

//     const user = await User.find({ token: token });
//     // console.log(user);
//     if (user) {
//       req.user = user;
//       console.log(user);
//       return next();

//       // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé     pourra avoir accès à req.user
//     } else {
//       return res.status(401).json({ error: "Unauthorized 1" });
//     }
//   } else {
//     return res.status(401).json({ message: "Unauthorized 2" });
//   }
// };

module.exports = isAuthenticated;
