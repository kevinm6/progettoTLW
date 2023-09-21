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

async function populatePlaylistCards(ddoptions) {
    const playlistsData = await fetchPlaylists();
    const playlistContainer = document.getElementById("playlistContainer");

    playlistsData.forEach(async playlist => {
        //var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
        var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
        const card = `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${playlist.title}${playlist.private ? '<i class="private bi bi-lock-fill text-success"></i>' : ''}</h5>
              <p class="card-text">${playlist.description}</p>
              <p class="card-text">Tags: <b>${playlist.tags}</b></p>
              <button class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}" onclick="showSongs('${playlist._id}', ${stringified})">
                View Songs
              </button>
              <button class="btn btn-primary mb-2" onclick="fetchEditPlaylist('${playlist._id}')">
                Edit playlist
              </button>
              <button class="btn btn-danger mb-2" onclick="deletePlaylist('${playlist._id}','${playlist.title}')">
                Delete
              </button>
              <div class="btn-group dropup mb-2 "id="dropDownToHide${playlist._id}">
                <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Add to Community
                </button>
                <div class="dropdown-menu dropdown-menu-right" id="communityDropdown${playlist._id}" aria-labelledby="dropdownMenuButton">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

        playlistContainer.innerHTML += card;
        await populateDropdown(playlist._id, ddoptions);
    });
}

async function populateDropdown(playlistID, dropdownOptions) {
    const dropdownMenu = document.getElementById(`communityDropdown${playlistID}`);
    const ddth = document.getElementById(`dropDownToHide${playlistID}`);
    dropdownMenu.innerHTML = "";
    if (dropdownOptions != null) {
        dropdownOptions.forEach((option) => {
            dropdownMenu.innerHTML += `<a class="dropdown-item" onClick='addPlaylistToCommunity("${playlistID}","${option._id}")'>${option.name}</a>`;
        });
    } else {
        ddth.classList.add('d-none');
    }
}

function addPlaylistToCommunity(playlistID, communityID) {
    var owner_id = localStorage.getItem("_id");
    fetch(`/addplaylisttocommunity/${communityID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist_id: playlistID, owner_id: owner_id }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Success: Playlist added to community");
            } else {
                response.text().then(errorMessage => {
                    alert(errorMessage);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
}

async function getDropdownOptions() {
    var owner_id = localStorage.getItem("_id");
    return fetch(`/communities/${owner_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json()
                    .then((data) => {
                        const dropdownOptions = data.map((community) => ({
                            name: community.name,
                            _id: community._id,
                        }));
                        console.log(dropdownOptions);
                        return dropdownOptions;
                    });
            } else if (response.status === 404) {
                // Handle a 404 error by returning null
                return null;
            } else {
                throw new Error('An error occurred. Try again later.');
            }
        })
        .catch((error) => {
            console.error(error);
            alert(error);
        });
}


async function fetchEditPlaylist(playlistID) {
    window.location.href = `/src/html/editplaylist.html?id=${playlistID}`;
}

async function deletePlaylist(playlistID, playlistTitle) {
    var del = await showConfirmationModal("Are you sure?", "You are about to delete the playlist: '" + playlistTitle + "'", "Delete playlist", "Cancel");
    if (!del) return;
    // Ottieni l'ID dall'archivio locale (localStorage)
    const localStorageID = localStorage.getItem("_id");

    // Crea l'URL con l'ID della playlist
    const url = `/deleteplaylist/${playlistID}`;

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
                window.location.href = "/playlist"
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
                window.location.href = "/playlist";
            }, 500);
        }
        else {
            alert("Errore durante la creazione della playlist");
        }
    });
}