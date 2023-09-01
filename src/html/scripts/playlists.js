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
                        <h5 class="card-title">${playlist.title}</h5>
                        <p class="card-text">${playlist.description}</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}"
                            onclick="showSongs('${playlist._id}', ${stringified})">
                            Visualizza Canzoni
                        </button>
                    </div>
                </div>
            </div>
        `;
        playlistContainer.innerHTML += card;
    });
}

function showSongs(playlistId, songsJson) {
    songsJson = (JSON.stringify(songsJson));
    const songs = JSON.parse(songsJson);
    const songsTableBody = document.getElementById("songsTableBody");
    songsTableBody.innerHTML = ""; // Pulisce la tabella

    songs.forEach(song => {
        const row = `
        <tr>
            <td>${song.title}</td>
            <td>${song.artist}</td>
            <td>${song.duration}</td>
        </tr>
    `;

        songsTableBody.innerHTML += row;
    });

    const songsModal = new bootstrap.Modal(document.getElementById("songsModal"));
    songsModal.show();
}
