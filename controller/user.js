const User = require("../models/user.js");

module.exports.renderSignup = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        //we did not mentioned in the schema, but passport-local-mongoose automatically adds the username
        const newUser = new User({email, username});
        //this method automatically saves the username with the hash of  password in mongoDB database
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Nestro! Your account has been created successfully.");
            res.redirect("/listings");
        });
    }catch(err){
        req.flash("error" , err.message);
        return res.redirect("/signup");
    };
};

module.exports.renderLogin = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
        req.flash("success", "Welcome to Nestro! You are logged in.");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if (err){
            return next(err);
        }
        res.clearCookie("connect.sid"); // to prevent from old session cookies and unexpected behaviour 
        req.flash("success","You are logged out");
        res.redirect("/listings");
    }
)};