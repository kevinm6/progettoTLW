/** File that contains scripts used in createplaylist.html exclusively*/

// function to add every selected song to the areabox
function addSelectedSong(songId, songTitle, artist, duration) {
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
function generateCards(trackname, artists, duration, albumname, trackid, trackurl) {
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
                <button class="btn btn-success add-button add-track" data-id="${trackid}" data-title="${trackname}"data-artists="${artists}"data-duration="${duration}">
                    Aggiungi
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
            addSelectedSong(songId, songTitle, artist, duration);
        });
    });
}