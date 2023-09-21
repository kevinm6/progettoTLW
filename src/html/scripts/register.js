/** This file does contain functions for the sole purpose of register functionality of register.html */

/** function to obtain genres from spotify by calling endpoint */
async function getSpotifyGenres() {
   try {
      const response = await fetch('/getGenres', {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json'
         }
      });

      if (response.ok) {
         const data = await response.json();
         return data.genres;
      } else {
         throw new Error('Failed to fetch genres');
      }
   } catch (error) {
      console.error('An error occurred:', error);
      throw error;
   }
}

/** Function to populate the dropdown menu for the genres */
async function populateGenresDropdown() {
   const genres = await getSpotifyGenres();
   const generiDropdown = document.getElementById('generi');

   genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre;
      option.text = genre;
      generiDropdown.appendChild(option);
   });

   // Enable multiple selection for the dropdown
   generiDropdown.setAttribute('multiple', 'multiple');
}

function register() {
   var email = document.getElementById('email');
   var nickname = document.getElementById('nickname');
   var password1 = document.getElementById('password1');
   var password2 = document.getElementById('password2');
   var nome = document.getElementById('nome');
   var cognome = document.getElementById('cognome');
   var data_di_nascita = document.getElementById('data_di_nascita');
   var generi = document.getElementById("generi");
   // Controllo password
   if (password1.value != password2.value || password1.value.length < 7) {
      password1.classList.add('border');
      password1.classList.add('border-danger');
      password2.classList.add('border');
      password2.classList.add('border-danger');
      alert("Passwords must be at least 7 characters long!");
      return;
   } else {
      password1.classList.remove('border');
      password1.classList.remove('border-danger');
      password2.classList.remove('border');
      password2.classList.remove('border-danger');
   }
   // Controllo data di nascita
   var dataPattern = /^\d{4}-\d{2}-\d{2}$/;
   if (!dataPattern.test(data_di_nascita.value)) {
      data_di_nascita.classList.add('border');
      data_di_nascita.classList.add('border-danger');
      alert("Birth date in wrong format!");
      return;
   } else {
      data_di_nascita.classList.remove('border');
      data_di_nascita.classList.remove('border-danger');
   }

   var dataParts = data_di_nascita.value.split('-');
   var year = parseInt(dataParts[0]);
   var month = parseInt(dataParts[1]);
   var day = parseInt(dataParts[2]);

   if (isNaN(year) || isNaN(month) || isNaN(day)) {
      data_di_nascita.classList.add('border');
      data_di_nascita.classList.add('border-danger');
      alert("Birth date in wrong format!");
      return;
   }

   var currentDate = new Date();
   if (year < 1900 || year > currentDate.getFullYear() || month < 1 || month > 12 || day < 1 || day > 31) {
      data_di_nascita.classList.add('border');
      data_di_nascita.classList.add('border-danger');
      alert("Birth date is not valid!");
      return;
   } else {
      data_di_nascita.classList.remove('border');
      data_di_nascita.classList.remove('border-danger');
   }
   // Controllo email con regexp
   var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
   if (!emailPattern.test(email.value)) {
      email.classList.add('border');
      email.classList.add('border-danger');
      alert("Inserisci un indirizzo email valido!");
      return;
   } else {
      email.classList.remove('border');
      email.classList.remove('border-danger');
   }

   // Controllo nickname con lunghezza e regexp
   var nicknamePattern = /^[a-zA-Z0-9_]{4,16}$/;
   if (!nicknamePattern.test(nickname.value)) {
      nickname.classList.add('border');
      nickname.classList.add('border-danger');
      alert("Il nickname deve avere tra 4 e 16 caratteri e contenere solo lettere, numeri e underscore!");
      return;
   } else {
      nickname.classList.remove('border');
      nickname.classList.remove('border-danger');
   }

   // Controllo altri campi
   if (!nome.value) {
      nome.classList.add('border');
      nome.classList.add('border-danger');
      alert("Inserisci il tuo nome!");
      return;
   } else {
      nome.classList.remove('border');
      nome.classList.remove('border-danger');
   }

   if (!cognome.value) {
      cognome.classList.add('border');
      cognome.classList.add('border-danger');
      alert("Inserisci il tuo cognome!");
      return;
   } else {
      cognome.classList.remove('border');
      cognome.classList.remove('border-danger');
   }

   // Altri controlli
   var generi_selezionati = document.querySelectorAll("#generi :checked");
   var generi_selezionati_values = [];
   for (var i = 0; i < generi_selezionati.length; i++) {
      generi_selezionati_values.push(generi_selezionati[i].value);
   }

   var data = {
      name: nome.value,
      nickname: nickname.value,
      surname: cognome.value,
      email: email.value,
      password: password1.value,
      date: data_di_nascita.value,
      genres: generi_selezionati_values // Includi l'array dei generi selezionati
   };

   // console.log(data);

   fetch('/register', {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
   }).then(async response => {
      if (response.ok) {
         localStorage.removeItem("_id");
         localStorage.removeItem("email");
         localStorage.removeItem("nickname");
         alert("Registrazione avvenuta con successo, verrai reindirizzato alla pagina di login");
         setTimeout(function () {
            window.location.replace("/#");
         }, 500);
      }
      else {
         response.text().then(errorMessage => {
            alert(errorMessage);
         });
      }
   }).catch(error => {
      console.error(error);
      alert(error);
   });
}
