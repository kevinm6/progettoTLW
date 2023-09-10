/** file created for dealing with function used in playlists.html exclusively */
async function fetchPlaylists() {
    try {
        const userId = localStorage.getItem("_id");
        const response = await fetch(`/playlist/${userId}`);
        const playlistsData = await response.json();
        return playlistsData;
    } catch (error) {
        console.error("Errore durante il recupero delle playlist:", error);
        return [];
    }
}


async function populatePlaylistCards() {
    const playlistsData = await fetchPlaylists();
    const playlistContainer = document.getElementById("playlistContainer");

    playlistsData.forEach(playlist => {
        //var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
        var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
        const card = `
        <div class="col-md-4 mb-4">
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${playlist.title}${playlist.private ? '<i class="bi bi-lock-fill text-success"></i>' : ''}</h5>
                <p class="card-text">${playlist.description}</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}"
                    onclick="showSongs('${playlist._id}', ${stringified})">
                    View Songs
                </button>
                <button class="btn btn-primary" onclick="fetchEditPlaylist('${playlist._id}')">
                    Edit playlist
                </button>
                <button class="btn btn-danger" onclick="deletePlaylist('${playlist._id}','${playlist.title}')" >
                    Delete
                </button>
                
            </div>
        </div>
    </div>
        `;
        playlistContainer.innerHTML += card;
    });
}

async function fetchEditPlaylist(playlistID) {
    window.location.href=`http://localhost:3000/src/html/editplaylist.html?id=${playlistID}`;
}

async function deletePlaylist(playlistID, playlistTitle) {
    var del = await showConfirmationModal(playlistID, playlistTitle);
    if (!del) return;
    // Ottieni l'ID dall'archivio locale (localStorage)
    const localStorageID = localStorage.getItem("_id");

    // Crea l'URL con l'ID della playlist
    const url = `http://localhost:3000/deleteplaylist/${playlistID}`;

    // Esegui la richiesta DELETE
    fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: localStorageID }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Playlist deleted succesfully!");
                window.location.href = "localhost:3000/playlist"
            } else {
                // Gestione degli errori
                alert("An error occurred. Try again later.");
            }
        })
        .catch((error) => {
            console.error("Errore durante la richiesta DELETE:", error);
            alert("Errore durante l'eliminazione della playlist.");
        });

}


// Funzione per mostrare il modal di conferma
async function showConfirmationModal(playlistID, playlistName) {
    return new Promise((resolve) => {
        // Ottieni riferimenti agli elementi del modal
        const confirmationModal = document.getElementById("confirmationModal");
        const cancelButton = document.getElementById("cancelButton");
        const confirmButton = document.getElementById("confirmButton");
        const playlistTitle = document.getElementById("playlistTitle");
        playlistTitle.textContent = playlistName;
        confirmationModal.style.display = "block";

        // Event listener per il pulsante di conferma
        confirmButton.addEventListener("click", function () {
            hideConfirmationModal();
            resolve(true); // Risolvi la Promise con 'true'
            return true;
        });

        // Event listener per il pulsante di annullamento
        cancelButton.addEventListener("click", function () {
            hideConfirmationModal();
            resolve(false); // Risolvi la Promise con 'false'
            return false;
        });
    });
}


// hide the modal
function hideConfirmationModal() {
    const confirmationModal = document.getElementById("confirmationModal");
    confirmationModal.style.display = "none";
    return;
}


function showSongs(playlistId, songsJson) {
    songsJson = (JSON.stringify(songsJson));
    const songs = JSON.parse(songsJson);
    const songsTableBody = document.getElementById("songsTableBody");
    songsTableBody.innerHTML = ""; // Pulisce la tabella

    songs.forEach(song => {
        console.log(song);
        const row = `
        <tr>
            <td>${song.title}</td>
            <td>${song.artist}</td>
            <td>${song.album}</td>
            <td></td>
            <td>${song.duration}</td>
            <td>${song.year}</td>
        </tr>
    `;

        songsTableBody.innerHTML += row;
    });

    const songsModal = new bootstrap.Modal(document.getElementById("songsModal"));
    songsModal.show();
}
