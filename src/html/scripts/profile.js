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
    var birthdate = document.getElementById("date").value;
    var updatedData = {
        _id: userId,
        email: userEmail,
        name: userName,
        surname: userSurname,
        nickname: userNickname,
        password: userPassword,
        date:birthdate,

    };
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
            response.text().then(errorMessage => {
                alert(errorMessage);
             });
        }
    }).catch(error => {
        console.error(error);
        alert(error);
    });
}
async function deleteUser(){
    del=await showConfirmationModal("Are you sure","By confirming you will delete your account. This action is irreversible","Delete","Cancel");
    if(!del)return;
    id=localStorage.getItem("_id");
    fetch(`/deleteUser/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(response => {
        if (response.ok) {
            alert("Account deleted!");
            localStorage.removeItem("email");
            localStorage.removeItem("nickname");
            localStorage.removeItem("_id");
            window.location.href = "/register";
        } else {
            response.text().then(errorMessage => {
                alert(errorMessage);
             });
        }
    }).catch(error => {
        console.error(error);
        alert(error);
    });
}
function logout() {
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    localStorage.removeItem("_id");
    window.location.href = "/login";
}