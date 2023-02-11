require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const sellerRouter = require("./routes/userSeller");
const userAuth = require("./middlewares/userAuth");
const offersRouter = require("./routes/userOffers");
const userProfile = require("./routes/userProfile");
const offersNoAuth = require("./routes/offersNoAuth");
const favourites = require("./routes/favourites");
const opinions = require("./routes/opinions");
const anyUser = require("./routes/anyUser");
const port = process.env.PORT || 5001;
const BASE_API = "https://ujccap-server-production.up.railway.app/api/v1/";

app.use(express.json());
app.use(express.static(__dirname));
app.use(`${BASE_API}auth`, userRouter);
app.use(`${BASE_API}offersNoAuth`, offersNoAuth);
app.use(`${BASE_API}seller`, userAuth, sellerRouter);
app.use(`${BASE_API}userOffers`, userAuth, offersRouter);
app.use(`${BASE_API}userProfile`, userAuth, userProfile);
app.use(`${BASE_API}favourites`, userAuth, favourites);
app.use(`${BASE_API}opinions`, opinions);
app.use(`${BASE_API}anyUser`, anyUser);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("server running");
    });
  })
  .catch((err) => console.log(err));
