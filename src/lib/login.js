// import { config } from "./../config/prefs.js";


// console.log(config.host)
/**
 * Maybe is useful use the objectid of mongodb to save it in localStorage and go on
 */


function login() {
   var email = document.getElementById('email').value
   var nickname = document.getElementById('nickname').value
   var password = document.getElementById('password').value

   user = {
      email: email,
      nickname: nickname,
      password: password
   }

   fetch(`localhost:${config.port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
   }).then(response => response.json())
      .then(logged_user => {
         localStorage.setItem("user", JSON.stringify(logged_user))
         window.location.href = "./../html/index.html"
      })
}

