const Sauce = require("../models/sauce");
const fs = require("fs");
const xss = require("xss");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  console.log(sauceObject);
  const sauce = new Sauce({
    name: xss(sauceObject.name),
    manufacturer: xss(sauceObject.manufacturer),
    description: xss(sauceObject.description),
    mainPepper: xss(sauceObject.mainPepper),
    heat: sauceObject.heat,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            ...sauceObject,
            name: xss(sauceObject.name),
            manufacturer: xss(sauceObject.manufacturer),
            description: xss(sauceObject.description),
            mainPepper: xss(sauceObject.mainPepper),
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          sauce
            .deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.likeSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    //
    .then((sauce) => {
      // Stockage de la valeur 'index' de l'Id dans les tableaux liked et Disliked
      const indexPositionUsersDisliked = sauce.usersDisliked.indexOf(
        req.body.userId
      );
      const indexPositionUsersLiked = sauce.usersLiked.indexOf(req.body.userId);
      // Indication si l'utilisateur à déja voté
      const userDislikedAlready = indexPositionUsersDisliked !== -1;
      const userLikedAlready = indexPositionUsersLiked !== -1;

      // like
      const like = req.body.like;
      if (like === 1) {
        if (!userLikedAlready && !userDislikedAlready) {
          sauce.usersLiked.push(req.body.userId);
          sauce.likes += 1;
        }
      } else if (0 === like) {
        if (userLikedAlready) {
          sauce.usersLiked.splice(indexPositionUsersLiked, 1);
          sauce.likes -= 1;

          //
        } else if (userDislikedAlready) {
          sauce.usersDisliked.splice(indexPositionUsersDisliked, 1);
          sauce.dislikes -= 1;
        }
      } else if (like === -1) {
        if (!userLikedAlready && !userDislikedAlready) {
          sauce.usersDisliked.push(req.body.userId);
          sauce.dislikes += 1;
        }
      } else {
        res.status(500).json({ error: "Procédure de Like inatendue" });
      }

      console.log(sauce);

      Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: "Objet modifié!" }))
        .catch((error) => res.status(401).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};
