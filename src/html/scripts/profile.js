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
function saveChanges() {
    var userEmail = document.getElementById("email").value;
    var userNickname = document.getElementById("nickname").value;
    var userPassword = document.getElementById("password").value;
    var userName = document.getElementById("nome").value;
    var userSurname = document.getElementById("cognome").value;
    var userId = localStorage.getItem("_id");
    var updatedData = {
        _id: userId,
        email: userEmail,
        name: userName,
        surname: userSurname,
        nickname: userNickname,
        password: userPassword

    };
    console.log(updatedData);
    fetch(`/users/${updatedData._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    }).then(response => {
        if (response.ok) {
            alert("Modifiche salvate con successo!");
            localStorage.setItem("email", userEmail);
            localStorage.setItem("nickname", userNickname);
            localStorage.setItem("_id", userId);
            window.location.href = "/profile";
        } else {
            throw new Error("Errore durante il salvataggio delle modifiche");
        }
    }).catch(error => {
        console.error("An error has occurred:", error);
    });
}

function logout() {
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    localStorage.removeItem("_id");
    window.location.href = "/login";
}