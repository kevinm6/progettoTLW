/**
 * @description Handles the login process for users.
 *
 * This function validates the inputs,
 * and sends a POST request to the server for login. If login is successful, it stores user information
 * in local storage and displays a success message; otherwise, it displays an error message.
 */
function login() {
   if (!validateForm())return;
   var nicknameOrEmail = document.getElementById('nicknameOrEmail');
   var password = document.getElementById('password');
   var data = {
      email: nicknameOrEmail.value,
      nickname: nicknameOrEmail.value,
      password: password.value
   };
   // POST REQUEST
   let container = document.getElementsByClassName('container')[0];
   container.innerHTML += ``
   fetch("/login", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
   }).then(response => {
      if (response.ok) {
         response.json().then(responseData => {
            container.innerHTML += `
                <div class="alert alert-success" role="alert" aria-hidden="true">
                  <h4 class="alert-heading">Succesfully logged in!</h4>
                </div>`

            // Save user_id in localStorage
            localStorage.setItem("_id", responseData._id);
            // Save user credentials in LocalStorage
            localStorage.setItem("email", responseData.email);
            localStorage.setItem("nickname", responseData.nickname);
            setTimeout(() => { window.location.href = '/login' }, 2000);
         });
      } else {
         container.innerHTML += `
            <div class="alert alert-danger" role="alert" aria-hidden="true">
              <h4 class="alert-heading">Failed to log in! Check your credentials</h4>
            </div>`
      }
   });
}
/**
 * Validates user input for login.
 *
 * This function retrieves user input for a nickname or email and password, validates the inputs,
 * and returns `true` if the inputs are valid, indicating that the form can be submitted. If the inputs
 * are invalid, it adds error classes to the respective input elements and displays an error message.
 *
 * @returns {boolean} `true` if the inputs are valid and the form can be submitted; otherwise, `false`.
 */
function validateForm() {
   var nicknameOrEmail = document.getElementById('nicknameOrEmail');
   var password = document.getElementById('password');
   // Remove error classes
   nicknameOrEmail.classList.remove('border', 'border-danger');
   password.classList.remove('border', 'border-danger');
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const isValidEmail = emailRegex.test(nicknameOrEmail.value);
   if (!isValidEmail && (
      !nicknameOrEmail.value ||
      nicknameOrEmail.value.length < 4 ||
      nicknameOrEmail.value.length > 16)) {
      nicknameOrEmail.classList.add('border', 'border-danger');
      alert("Nickname / Email is not valid!");
      return false;
   }
   if (!password.value || password.value.length < 7) {
      password.classList.add('border', 'border-danger');
      alert("Passwords must have at least 7 characters!");
      return false;
   }
   return true;
}
/**
 * Checks if a user is already logged in and redirects them if necessary.
 *
 * This function checks if user credentials are stored in local storage, indicating that the user
 * is already logged in. If both email and nickname are found in local storage, the user is redirected
 * to their profile page.
 *
 * @returns {void}
 */
function checkUserLogged() {
   var email = localStorage.getItem("email");
   var nickname = localStorage.getItem("nickname");
   if (email && nickname) {
      // User is logged, bring him to profile page
      window.location.href = "/profile";
   }
}