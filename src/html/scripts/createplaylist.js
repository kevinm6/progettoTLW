/** File that contains scripts used in createplaylist.html exclusively*/

// function to add every selected song to the areabox
function addSelectedSong(songId, songTitle, artist, duration,year,album) {
    const selectedSongsContainer = document.getElementById("selectedSongs");
    // Verifica se l'elemento è già presente
    const existingElement = Array.from(selectedSongsContainer.children).find(element => {
        return element.dataset.songId === songId;
    });

    // if the song with that ID doesn't exist, should be added
    if (!existingElement) {
        const selectedSongDiv = document.createElement("div");
        selectedSongDiv.classList.add("selected-song");
        selectedSongDiv.dataset.songId = songId; 
        selectedSongDiv.dataset.artist = artist;
        selectedSongDiv.dataset.duration = duration;
        selectedSongDiv.dataset.year = year;
        selectedSongDiv.dataset.album = album;
        const songTitleSpan = document.createElement("span");
        songTitleSpan.textContent = songTitle;

        const removeButton = document.createElement("button");
        removeButton.classList.add("btn", "remove/button", "btn-sm", "ms-2");
        removeButton.innerHTML = "&times;";
        removeButton.addEventListener("click", () => {
            selectedSongsContainer.removeChild(selectedSongDiv);
        });

        selectedSongDiv.appendChild(songTitleSpan);
        selectedSongDiv.appendChild(removeButton);
        selectedSongsContainer.appendChild(selectedSongDiv);
        return;
    }
}

// function to generate Cards given the information
function generateCards(trackname, artists, duration, albumname, trackid, trackurl,year) {
    const trackCard = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${trackname}</h5>
                <p class="card-text">Artisti: ${artists}</p>
                <p class="card-text">Durata: ${duration}</p>
                <p class="card-text">Album: ${albumname}</p>
                <p class="card-text">Spotify ID: ${trackid}</p>
                <div class="audio-player">
                    <audio controls class="custom-audio-player">
                        <source src="${trackurl}" type="audio/mpeg">
                        Il tuo browser non supporta l'elemento audio.
                    </audio>
                </div>
                <button class="btn btn-success add-button add-track" data-id="${trackid}" data-title="${trackname}" data-artists="${artists}" data-duration="${duration}" data-year="${year}" data-album="${albumname}">
                    Add song
                </button>
            </div>
        </div>
    `;

    return trackCard;

}

function aggiungiButtonManager() {
    // button manager for adding cards to the areabox 
    const addButtons = document.querySelectorAll(".add-track");
    addButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const songId = event.target.getAttribute("data-id");
            const songTitle = event.target.getAttribute("data-title");
            const artist = event.target.getAttribute("data-artists");
            const duration = event.target.getAttribute("data-duration");
            const year = event.target.getAttribute("data-year");
            const album = event.target.getAttribute("data-album");
            addSelectedSong(songId, songTitle, artist, duration,year,album);
        });
    });
}

function creaplaylist() {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var tags = document.getElementById("tags").value;
    var isprivate = document.getElementById("privateToggle").checked;

    // Prendi tutti gli elementi con classe "selected-song"
    const selectedSongElements = document.querySelectorAll(".selected-song");

    // Creo un array di oggetti con id e titolo delle canzoni selezionate
    const selectedSongsData = Array.from(selectedSongElements).map(element => {
        const songId = element.dataset.songId;
        const artist = element.dataset.artist;
        const duration = element.dataset.duration;
        const songTitle = element.querySelector("span").textContent;
        const year = element.dataset.year;
        const genre = element.dataset.genre;
        const album=element.dataset.album;
        return { id: songId, title: songTitle, artist: artist, duration: duration,year:year, album:album };
    });

    // Dati da inviare
    const playlistData = {
        title: title,
        description: description,
        tags: tags.split(",").map(tag => tag.trim()),
        songs: selectedSongsData,
        owner_id: localStorage.getItem("_id"),
        private: isprivate
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