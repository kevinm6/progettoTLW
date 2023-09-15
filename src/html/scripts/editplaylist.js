async function saveChanges(){
    var title=document.getElementById("title").value;
    var description=document.getElementById("description").value;
    var tags=document.getElementById("tags").value;
    var private=document.getElementById("privateToggle").checked;
    var owner_id=localStorage.getItem("_id");
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    var del = await showConfirmationModal("Are you sure?","You are about to edit this playlist data","Edit playlist","Cancel");
    if (!del) return;
    var updatedData={
        title:title,
        description:description,
        tags:tags,
        private:private,
        owner_id:owner_id
    }
    try {
        const response = await fetch(`/updateplaylist/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert("Playlist updated successfully");
            window.location.href="http://localhost:3000/src/html/editplaylist.html?id="+id;
        } else {

            alert("An error occurred while updating the playlist. Please try again later.");
        }
    } catch (error) {
        console.error("Error updating playlist:", error);
        alert("An error occurred while updating the playlist. Please try again later.");
    }
}
async function fetchAndPopulate(id) {
    const playlistData = await fetchplaylist(id);
    const songsContainer = document.getElementById("songsContainer");
    document.getElementById("title").value=playlistData.title;
    document.getElementById("description").value=playlistData.description;
    document.getElementById("tags").value=playlistData.tags;
    document.getElementById("privateToggle").checked=playlistData.private;

    songsContainer.innerHTML = '';
    playlistData.songs.forEach((song) => {
        const trackCardHTML = generateTrackCard(song,id);
        songsContainer.insertAdjacentHTML('beforeend', `<div class="song-card">${trackCardHTML}</div>`);
    });
}

function generateTrackCard(song,id) {
    const trackCard = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${song.title}</h5>
                <p class="card-text">Artisti: ${song.artist}</p>
                <p class="card-text">Durata: ${song.duration}</p>
                <p class="card-text">Year: ${song.year}</p>
                <p class="card-text">Album: ${song.album}</p>
                <button class="btn btn-danger remove-button" data-id="${song.id}" onclick="deleteSong('${song.id}','${id}')">
                Rimuovi
            </button>
            </div>
        </div>
    `;

    return trackCard;
}

async function deleteSong(trackid, playlistID) {
    console.log(trackid);
    const owner_id = localStorage.getItem("_id");
    var del = await showConfirmationModal("Are you sure?","You are about to delete this Song from the playlist","Delete Song","Cancel");
    if (!del) return;
    // Ottieni l'ID dall'archivio locale (localStorage)
    fetch(`http://localhost:3000/deleteSongFromPlaylist`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlist_id: playlistID,
        track_id: trackid,
        owner_id: owner_id,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          alert("Song removed successfully");
          window.location.href="http://localhost:3000/src/html/editplaylist.html?id="+playlistID;
        } else {
          alert("An error has occurred, please try again later");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error has occurred, please try again later");
      });
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

function generateCards(trackname, artists, duration, albumname, trackid, trackurl,year) {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistID = urlParams.get("id");
    var song={
        id:trackid,
        title:trackname,
        artist:artists,
        duration:duration,
        year:year,
        album:albumname
    }
    song=JSON.stringify(song).replace(/"/g, '&quot;');   
    console.log(song);
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
                        Your browser does not support audio type
                    </audio>
                </div>
                <button class="btn btn-success add-button add-track" onclick="addSong('${playlistID}', '${song}')">
                Add song
            </button>
            
            </div>
        </div>
    `;

    return trackCard;

}

function addSong(playlistID,song){
    console.log(JSON.parse(song));
}