function populateUserProfile(userData) {
    // Mostra i dati dell'utente nel profilo
    document.getElementById("nickname").value = userData.nickname;
    document.getElementById("email").value = userData.email;
    document.getElementById("password").value = "";

    document.getElementById("nome").value = userData.name;
    document.getElementById("cognome").value = userData.surname;
    document.getElementById("genres").value = userData.genres.join(", ");
    document.getElementById("date").value = userData.date;
}