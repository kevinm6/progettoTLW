async function authenticateUser() {
    // Verifica se l'utente è loggato
    if (!localStorage.getItem("nickname") || !localStorage.getItem("email")) {
        return "ERR_NOT_LOGGED";
    }

    try {
        const response = await fetch('/authuser', {
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
    fetch(`/users/${updatedData._id}`, {
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
    localStorage.removeItem("_id");
    window.location.href = "http://localhost:3000/login";
}

function msToTime(msStr) {
    const padZero = (num) => (num < 10 ? "0" + num : num);

    const totalMilliseconds = parseInt(msStr, 10);
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function creaplaylist() {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var tags = document.getElementById("tags").value;

    // Prendi tutti gli elementi con classe "selected-song"
    const selectedSongElements = document.querySelectorAll(".selected-song");

    // Creo un array di oggetti con id e titolo delle canzoni selezionate
    const selectedSongsData = Array.from(selectedSongElements).map(element => {
        const songId = element.dataset.songId;
        const artist = element.dataset.artist;
        const duration = element.dataset.duration;
        const songTitle = element.querySelector("span").textContent;
        return { id: songId, title: songTitle, artist: artist, duration: duration };
    });

    // Dati da inviare
    const playlistData = {
        title: title,
        description: description,
        tags: tags.split(",").map(tag => tag.trim()),
        songs: selectedSongsData,
        owner_id: localStorage.getItem("_id")
    };
    console.log(playlistData);

    // Effettua la richiesta POST all'endpoint
    fetch('/createplaylist', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playlistData)
    }).then(async response => {
        if (response.ok) {
            alert("Playlist creata con successo");
            setTimeout(function () {
                window.location.href = "http://localhost:3000/playlist";
            }, 500);
        }
        else {
            alert("Errore durante la creazione della playlist");
        }
    });
}


