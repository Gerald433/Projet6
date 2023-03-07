const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
require("dotenv").config();
const routeSauce = require("./routes/sauce");
const userRoutes = require("./routes/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const nocache = require("nocache");
const rateLimit = require("express-rate-limit");

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(nocache());

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: true,
      secure: false, //mettre à true en production
    },
  })
);

app.use(mongoSanitize());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use((req, res, next) => {
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
