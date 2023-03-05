const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const xss = require("xss");
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");

function isSecurePassword(password) {
  var schema = new passwordValidator();

  // Add properties to it
  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits(2) // Must have at least 2 digits
    .has()
    .not()
    .spaces(); // Should not have spaces

  return schema.validate(password);
}

exports.signup = (req, res, next) => {
  if (isSecurePassword(req.body.password)) {
    res.status(400).json({ error: "unsecure password" });
    return;
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      console.log("ok");
      if (!emailValidator.validate(req.body.email)) {
        throw new Error("adresse email invalide");
      }
      const user = new User({
        email: xss(req.body.email),
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
      console.log("ca passe");
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })

    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "paire identifiant/mot de passe incorrecte" });
      } else {
        bcrypt

          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "paire identifiant/mot de passe incorrecte" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
