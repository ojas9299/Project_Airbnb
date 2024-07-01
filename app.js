if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expresserror.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");

// SETUP WORKFLOW ENVIRONMENT

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// SETUP DATABASE

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Airbnb");
  console.log("Connection Successful✈️");
}

main().catch((e) => {
  console.log(e);
});

// ======*****SETUP COMPLETE*****======

//sessions
const sessionOptions = {
  secret: "secrectcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.del = req.flash("del");
  res.locals.updated = req.flash("updated");
  res.locals.reviewCreated = req.flash("reviewCreated");
  res.locals.reviewdeleted = req.flash("reviewdeleted");
  res.locals.err = req.flash("err");
  res.locals.usercreated = req.flash("usercreated");
  res.locals.currUser = req.user;

  next();
});

// //demouser
// app.get("/demouser", async (req, res) => {
//   let fuser = new User({
//     email: "fakeemail.commm",
//     username: "fakeeuserrm",
//   });

//   let registedUser = await User.register(fuser, "passworddd");
//   res.send(registedUser);
// });

//HOME ROUTE
app.get("/home", (req, res) => {
  res.render("./listings/home.ejs");
});

// Using Router routes
app.use("/listing", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

// Error Handling Queries
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!!"));
});

// Error Handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("./listings/error.ejs", { message });
});

// Start the server
app.listen(3000, () => {
  console.log("Listening on port 3000🚀🎉");
});
