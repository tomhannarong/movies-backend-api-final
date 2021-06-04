const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;

const SECRET_KEY = "ayoyo";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: SECRET_KEY,
}
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    console.log(payload.sub);
    if (payload.sub === "09cf9de8-e7be-41ba-970c-04ecd2986868" && payload.exp >= Date.now()) done(null, true);

    else if (payload.sub === "0" && payload.exp >= Date.now()) done(null, true);
    
    else done("null", false);
});

// strategy add in passport
passport.use(jwtAuth);
//Passport Middleware
module.exports.requireJWTAuth = passport.authenticate("jwt",{session:false});