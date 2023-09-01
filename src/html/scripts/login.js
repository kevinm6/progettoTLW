function login() {
    var nicknameOrEmail = document.getElementById('nicknameOrEmail');
    var password = document.getElementById('password');

    // Rimuovi eventuali classi di errore preesistenti
    nicknameOrEmail.classList.remove('border', 'border-danger');
    password.classList.remove('border', 'border-danger');

    // Verifica validità mail || nickname
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(nicknameOrEmail.value);

    if (!isValidEmail && (
       !nicknameOrEmail.value ||
          nicknameOrEmail.value.length < 4 ||
          nicknameOrEmail.value.length > 16)) {

       nicknameOrEmail.classList.add('border', 'border-danger');
       alert("Inserisci il nickname o un indirizzo email valido!");
       return;
    }

    // Verifica validità password
    if (!password.value || password.value.length < 7) {
       password.classList.add('border', 'border-danger');
       alert("La password deve avere almeno 7 caratteri!");
       return;
    }

    var data = {
       email: isValidEmail ? nicknameOrEmail.value : undefined,
       nickname: !isValidEmail ? nicknameOrEmail.value : undefined,
       password: password.value
    };

    // Effettua la richiesta POST al server
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
                console.log(container);

                container.innerHTML += `
                <div class="alert alert-success" role="alert" aria-hidden="true">
                  <h4 class="alert-heading">Succesfully logged in!</h4>
                </div>`

                // TODO:  think about save an object in localStorage instead of 3/4 keys

                // Save user_id in localStorage
                localStorage.setItem("_id", responseData._id);
                // Save user credentials in LocalStorage
                localStorage.setItem("email", responseData.email);
                localStorage.setItem("nickname", responseData.nickname);
                // Reindirizza alla pagina di login
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

 function checkUserLogged(){
    var email = localStorage.getItem("email");
    var nickname = localStorage.getItem("nickname");
    if (email && nickname) {
       // User is logged, bring him to profile page
       window.location.href = "/profile";
    }
 }