
/**
 * Adds a selected song to the selected songs container.
 *
 * This function creates a new HTML element representing a selected song and appends it
 * to the selected songs container. If a song with the same ID already exists in the container,
 * it won't be added again.
 * @param {string} songId - The ID of the song.
 * @param {string} songTitle - The title of the song.
 * @param {string} artist - The artist of the song.
 * @param {string} duration - The duration of the song.
 * @param {string} year - The release year of the song.
 * @param {string} album - The album of the song.
 */
function addSelectedSong(songId, songTitle, artist, duration,year,album) {
    const selectedSongsContainer = document.getElementById("selectedSongs");
    // Check if the element exists
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

/**
 * @description Generates an HTML card element for a music track.
 * This function takes track information such as track name, artists, duration, album name,
 * track ID, track URL, and release year, and generates an HTML card element displaying this information.
 * It also includes an audio player for the track and a button to add the song to a playlist.
 *
 * @param {string} trackname - The name of the track.
 * @param {string} artists - The artists of the track.
 * @param {string} duration - The duration of the track.
 * @param {string} albumname - The name of the album containing the track.
 * @param {string} trackid - The ID of the track.
 * @param {string} trackurl - The URL of the track.
 * @param {string} year - The release year of the track.
 * @returns {string} - An HTML card element representing the music track.
 */
function generateCards(trackname, artists, duration, albumname, trackid, trackurl,year) {
    const trackCard = `
    <div class="col-sm-6 mb-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${trackname}</h5>
                <p class="card-text">Artisti: ${artists}</p>
                <p class="card-text">Durata: ${duration}</p>
                <p class="card-text">Album: ${albumname}</p>
                <p class="card-text">Spotify ID: ${trackid}</p>
                <div class="d-none d-md-block d-lg-none"> 
                    <div class="audio-player">
                        <audio controls class="custom-audio-player">
                            <source src="${trackurl}" type="audio/mpeg">
                            Il tuo browser non supporta l'elemento audio.
                        </audio>
                    </div>
                </div>
                <button class="btn btn-success add-button add-track" data-id="${trackid}" data-title="${trackname}" data-artists="${artists}" data-duration="${duration}" data-year="${year}" data-album="${albumname}">
                    Add song
                </button>
            </div>
        </div>
    </div>
`;
    return trackCard;
    
}
/**
 * @description Manages the behavior of "Add Song" buttons.
 * This function adds event listeners to "Add Song" buttons on music track cards. When a button is clicked,
 * it prevents the default behavior, retrieves the song information from the button's data attributes,
 * and calls the `addSelectedSong` function to add the selected song to a playlist.
 */
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
/**
 * @description Creates a new playlist based on user input and selected songs.
 * This function retrieves user input such as the playlist title, description, tags, and privacy setting.
 * It also collects information about selected songs and sends a POST request to create the playlist on the server.
 * Upon successful creation, it redirects the user to the playlist page; otherwise, it displays an error message.
 */
function creaplaylist() {
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var tags = document.getElementById("tags").value;
    var isprivate = document.getElementById("privateToggle").checked;
    // get all elements with attribute "selected-song"
    const selectedSongElements = document.querySelectorAll(".selected-song");
    // Creates an array of selected songs
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

    // JSON files to be sent
    const playlistData = {
        title: title,
        description: description,
        tags: tags.split(",").map(tag => tag.trim()),
        songs: selectedSongsData,
        owner_id: localStorage.getItem("_id"),
        private: isprivate
    };
    console.log(playlistData);

    // endpoint post request to create data
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