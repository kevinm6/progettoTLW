async function fetchAndPopulate(id) {
    const playlistData = await fetchplaylist(id);
    const songsContainer = document.getElementById("songsContainer");
    document.getElementById("title").value=playlistData.title;
    document.getElementById("description").value=playlistData.description;
    document.getElementById("tags").value=playlistData.tags;

    songsContainer.innerHTML = '';
    playlistData.songs.forEach((song) => {
        const trackCardHTML = generateTrackCard(song);
        songsContainer.insertAdjacentHTML('beforeend', `<div class="song-card">${trackCardHTML}</div>`);
    });
}

function generateTrackCard(song) {
    const trackCard = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${song.title}</h5>
                <p class="card-text">Artisti: ${song.artist}</p>
                <p class="card-text">Durata: ${song.duration}</p>
                <p class="card-text">Year: ${song.year}</p>
                <p class="card-text">Album: ${song.album}</p>
                <button class="btn btn-danger remove-button" data-id="${song._id}">
                Rimuovi
            </button>
            </div>
        </div>
    `;

    return trackCard;
}


async function fetchplaylist(playlistid) {
    const owner_id=localStorage.getItem("_id");
    try {
        const response = await fetch(`/getplaylist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: playlistid,
                owner_id: owner_id
            })
        });

        if (!response.ok) {
            throw new Error("Error while performing request");
        }

        const playlistData = await response.json();
        console.log(playlistData);
        return playlistData;
    } catch (error) {
        console.log(error);
        return null;
    }
}