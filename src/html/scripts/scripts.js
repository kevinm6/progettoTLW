// profile.js

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

async function authenticateUser() {
    // Verifica se l'utente è loggato
    if (!localStorage.getItem("nickname") || !localStorage.getItem("email")) {
        return "ERR_NOT_LOGGED";
    }

    try {
        const response = await fetch("http://localhost:3000/authuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: localStorage.getItem("email"),
                nickname: localStorage.getItem("nickname"),
                _id: localStorage.getItem("_id") // invio dell'id al posto della password.
            })
        });

        if (!response.ok) {
            throw new Error("Autenticazione non valida");
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        return "ERR";
    }
}

function saveChanges() {
    var useremail = document.getElementById("email").value;
    var usernickname = document.getElementById("nickname").value;
    var userpassword = document.getElementById("password").value;
    var username = document.getElementById("nome").value;
    var usersurname = document.getElementById("cognome").value;
    var userid = localStorage.getItem("_id");
    var updatedData = {
        _id: userid,
        email: useremail,
        name: username,
        surname: usersurname,
        nickname: usernickname,
        password: userpassword

    };
    console.log(updatedData);
    fetch(`http://localhost:3000/users/${updatedData._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    }).then(response => {
        if (response.ok) {
            alert("Modifiche salvate con successo!");
            localStorage.setItem("email", useremail);
            localStorage.setItem("nickname", usernickname);
            localStorage.setItem("_id", userid);
            window.location.href = "http://localhost:3000/profile";
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
    localStorage.removeItem("password");
    window.location.href = "http://localhost:3000/login";
}
