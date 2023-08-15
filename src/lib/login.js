// import { config } from "./../config/prefs.js";

/**
 * Maybe is useful use the objectid of mongodb to save it in localStorage and go on
 */

// import { ObjectId } from "mongodb";
import { getUsers, getUser, dbUserCollection } from "./user.js";


/**
 * Async function to get specific user from id
 *
 * @param {string} req - request passed from express
 * @param {string} res - response passed from express
 * @returns {object | string} user information from id passed as request param or status error
 */
export async function login(req, res) {
   let login = req.body;

   if (login.email == undefined) {
      res.status(400).send("Missing Email");
      return;
   }
   if (login.nickname == undefined) {
      res.status(400).send("Missing Email");
      return;
   }
   if (login.password == undefined) {
      res.status(400).send("Missing Password");
      return;
   }

   login.password = hash(login.password);

   let collection = await dbUserCollection();
   var filter = {
      $and: [{ email: login.email }, { nickname: login.nickname } , { password: login.password }],
   };
   let loggedUser = await collection.findOne(filter);

   if (loggedUser == null) {
      res.status(401).send("Unauthorized");
   } else {
      res.json(loggedUser);
   }
}



// function login() {
//    var email = document.getElementById('email').value
//    var nickname = document.getElementById('nickname').value
//    var password = document.getElementById('password').value

//    user = {
//       email: email,
//       nickname: nickname,
//       password: password
//    }

//    fetch(`localhost:${config.port}/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(user)
//    }).then(response => response.json())
//       .then(logged_user => {
//          localStorage.setItem("user", JSON.stringify(logged_user))
//          window.location.href = "./../html/index.html"
//       })
// }

