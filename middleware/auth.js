"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

//TODO worked on this
//Checks res.locals information to determine if logged in user is an admin
function ensureAdmin(req, res, next){
  try {
    if (res.locals.user.isAdmin === true){
      return next();
    }
    else {
      return next({status: 401, message: "Unauthorized"});
    }
  }
  catch(err){
    return next({status: 401, message: "Unauthorized"});
  }
}

//Checks to see if logged in user is an admin or if they match the parameter username
function ensureAdminOrCorrectUser(req, res, next){
  try{
    if((res.locals.user.isAdmin === true) || (res.locals.user.username === req.params.username)){
      return next();
    }
    else {
      return next({status: 401, message: "Unauthorized"});
    }
  }
  catch (err) {
    return next({status: 401, message: "Unauthorized"});
  }
}
module.exports = {
  ensureAdminOrCorrectUser,
  ensureAdmin,
  ensureCorrectUser,
  authenticateJWT,
  ensureLoggedIn,
};
