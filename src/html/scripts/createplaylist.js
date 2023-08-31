/** File that contains scripts used in createplaylist.html exclusively*/
// Funzione per aggiungere una canzone selezionata
function addSelectedSong(songId, songTitle, artist, duration) {
    const selectedSongsContainer = document.getElementById("selectedSongs");
    // Verifica se l'elemento è già presente
    const existingElement = Array.from(selectedSongsContainer.children).find(element => {
        return element.dataset.songId === songId;
    });

    // Se non esiste già un elemento con lo stesso ID, aggiungilo
    if (!existingElement) {
        const selectedSongDiv = document.createElement("div");
        selectedSongDiv.classList.add("selected-song");
        selectedSongDiv.dataset.songId = songId; // Imposta l'attributo personalizzato
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
    }

    async function auth() {
        try {
            const userData = await authenticateUser();
            console.log(userData);
            if (userData === "ERR") {
                console.error("Errore durante l'autenticazione:", error);
                alert("Errore durante l'autenticazione, rifare il login");
                logout();
                throw new Error("Errore durante l'autenticazione");
            } else if (userData === "ERR_NOT_LOGGED") {
                alert("Effettua il login per creare una playlist");
                window.location.href = "http://localhost:3000/login";
                throw new Error("Utente non loggato");
            }
        } catch (error) {
            console.error("Errore durante l'esecuzione:", error);
        }
    }

    function generateCards(){
        const searchInput = document.getElementById("searchInput");
        const searchResults = document.getElementById("searchResults");

        searchInput.addEventListener("input", async () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 0) {
                try {
                    const response = await fetch(`http://localhost:3000/search?q=${searchTerm}&type=track`);
                    const tracksData = await response.json();

                    searchResults.innerHTML = "";

                    tracksData.tracks.items.forEach((track) => {
                        const artists = track.artists.map((artist) => artist.name).join(", ");
                        var duration = msToTime(track.duration_ms);
                        const trackCard = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">${track.name}</h5>
                                    <p class="card-text">Artisti: ${artists}</p>
                                    <p class="card-text">Durata: ${duration}</p>
                                    <p class="card-text">Album: ${track.album.name}</p>
                                    <p class="card-text">Spotify ID: ${track.id}</p>
                                    <div class="audio-player">
                                        <audio controls class="custom-audio-player">
                                            <source src="${track.preview_url}" type="audio/mpeg">
                                            Il tuo browser non supporta l'elemento audio.
                                        </audio>
                                    </div>
                                    <button class="btn btn-success add-button add-track" data-id="${track.id}" data-title="${track.name}"data-artists="${artists}"data-duration="${duration}">
                                        Aggiungi
                                    </button>
                                </div>
                            </div>
                        `;
                        searchResults.insertAdjacentHTML("beforeend", trackCard);
                    });

                    // gestore di eventi al bottone Aggiungi di ogni card
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
                } catch (error) {
                    console.error("Errore durante la ricerca delle tracce:", error);
                }
            } else {
                // Clear search results if search input is empty
                searchResults.innerHTML = "";
            }
        });

    }
}