const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];

    if (!MIME_TYPES[file.mimetype]) {
      callback(new Error("Incorrect type mime"));
      return;
    }

    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
