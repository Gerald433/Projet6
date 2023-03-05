const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
require ('dotenv').config();
const routeSauce = require("./routes/sauce");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.tbhdw7d.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use((req, res, next) => {
  console.log("traitement des headers");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/sauces", routeSauce);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;