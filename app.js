if(process.env.NODE_ENV != "production"){
  require("dotenv").config();//env file is not used in production
}

const express = require("express");
const mongoose = require("mongoose");//making sure that after the mongodb connection the server get started otherwise there will be an error if mongodb takes much time to connect
const app = express();
let port = 8080;


const path = require("path");
var methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expresserror.js");
const cors = require('cors');//enabling the cors for resourse sharing (> npm i cors)
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());// This middleware is required to parse JSON body
app.use(cors());

main()
  .then(() => {
    console.log("Successfully connected to mongodb");
    app.listen(port, () => {
      console.log(`Listening to port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect",err);
  });

async function main() {
  console.time("MongoConnect");
  //  await mongoose.connect('mongodb://127.0.0.1:27017/Nestro');
  await mongoose.connect(process.env.ATLASDB_URL);
  console.timeEnd("MongoConnect");
}

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter: 24*3600,
});

store.on("error",(err)=>{
  console.log("Error in mongo session store",err);
});

const sessionOptions = {
  store,
  secret : process.env.SECRET,
  resave :false,
  saveUninitialized :true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7* 24*60*60*1000,
    httpOnly:true //for prevention of cross-scripting attacks (security)
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//we use session passport also because once the user is login then for all pages he should be loggedin.
app.use(passport.session());//prevent user to not login for every request
passport.use(new LocalStrategy(User.authenticate()));
//static serialize and deserialize models
passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  //these are stored in locals
  // res.locals are set up for showing data in templates as req and res are not avail in ejs
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// app.use((err,req,res,next)=>{
//   if (err.name === "ValidationError" || err.name==="CastError"){
//     res.send(`There was a ${err.name} . Please folow the rules`);
//     console.log(`There was a ${err.name} . Please folow the rules`);
//   }
//   next(err);// it passes the error to next middleware leading to another response
// }); // we get error in serverside as ERR_HTTP_HEADERS_SENT , because we are sending the resonse two times(res.send , next(err)-pointing to next middleware response)
      // so to overcome that observe the below code
app.use((err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "CastError") {
    console.log(`There was a ${err.name}. Please follow the rules.`);
    let message=`There was a ${err.name}. Please follow the rules.`
    return res.render("listings/error",{message}); //this means that in a chaining of middlewares , when we return it does not go to next(err) response
  }
  next(err);
});

app.all("*",(req,res,next)=>{   
  next(new ExpressError(404,"Page Not Found !!"));
});

app.use((err,req,res,next)=>{
  const {statusCode=500 , message="Something went wrong"}=err;
  res.status(statusCode).render("listings/error.ejs",{message});
});

//500-server-side error , 200 - server is successfully responding the request