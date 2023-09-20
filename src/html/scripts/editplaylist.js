/**
 * @description Asynchronously saves changes made to a playlist.
 * This function retrieves user-modified playlist information such as title, description, tags, and privacy settings.
 * It also obtains the owner's ID and the playlist ID from the URL.
 * It then displays a confirmation modal to ensure the user's intent.
 * If the user confirms, it sends a PUT request to update the playlist data on the server.
 * Upon successful update, it alerts the user and redirects to the updated playlist page; otherwise, it displays an error message.
 */
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
        tags:tags.split(",").map(tag => tag.trim()),
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
            window.location.href="/src/html/editplaylist.html?id="+id;
        } else {

            alert("An error occurred while updating the playlist. Please try again later.");
        }
    } catch (error) {
        console.error("Error updating playlist:", error);
        alert("An error occurred while updating the playlist. Please try again later.");
    }
}
/**
 * @description Asynchronously fetches playlist data and populates the edit playlist page with the retrieved data.
 * This function takes a playlist ID as an argument and uses it to fetch playlist information from the server.
 * It updates the input fields for title, description, tags, and privacy settings with the fetched data.
 * Additionally, it clears the songsContainer to prepare for populating it with the playlist's songs.
 * It iterates through each song in the playlist data and generates a track card for it using the 'generateTrackCard' function.
 * Finally, it inserts the track cards into the songsContainer on the edit playlist page.
 *
 * @param {string} id - The ID of the playlist to fetch and populate.
 */
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
        songsContainer.insertAdjacentHTML('beforeend', `${trackCardHTML}`);
    });
}
/**
 * Generates an HTML card element representing a song track.
 *
 * This function takes a 'song' object and a 'playlistId' as arguments. It uses the properties of the 'song' object
 * (title, artist, duration, year, album) to dynamically create an HTML card element. The card displays information
 * about the song, including its title, artist, duration, year, and album. It also includes a "Remove" button with
 * an `onclick` event that calls the 'deleteSong' function with the song's ID and the playlist's ID ('playlistId').
 *
 * @param {Object} song - The song object containing song details (title, artist, duration, year, album).
 * @param {string} playlistId - The ID of the playlist to which the song belongs.
 * @returns {string} - An HTML string representing the song track card.
 */
function generateTrackCard(song,id) {
    var trackCard = `
    <div class="col-lg-3 col-md-6 col-12 mb-3">
        <div class="card">
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
    </div>
`;

    return trackCard;
}

/**
 * @description Deletes a song from a playlist and handles the confirmation modal.
 * This function takes the 'trackid' (ID of the song to be deleted) and 'playlistID' (ID of the playlist from which
 * the song will be removed) as arguments. It also retrieves the owner's ID from local storage. The function displays
 * a confirmation modal asking the user if they are sure they want to delete the song. If the user confirms the
 * deletion, an HTTP DELETE request is sent to the server to remove the song from the playlist.
 *
 * @param {string} trackid - The ID of the song to be deleted.
 * @param {string} playlistID - The ID of the playlist from which the song will be removed.
 */
async function deleteSong(trackid, playlistID) {
    console.log(trackid);
    const owner_id = localStorage.getItem("_id");
    var del = await showConfirmationModal("Are you sure?","You are about to delete this Song from the playlist","Delete Song","Cancel");
    if (!del) return;
    fetch(`/deleteSongFromPlaylist`, {
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
          window.location.href="/src/html/editplaylist.html?id="+playlistID;
        } else {
          alert("An error has occurred, please try again later");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error has occurred, please try again later");
      });
}
  
/**
 * @description Fetches playlist data from the server.
 * This function sends an HTTP POST request to the server to retrieve playlist data based on the provided 'playlistid'
 * and the owner's ID retrieved from local storage. The function handles potential errors during the request and returns
 * the playlist data if the request is successful.
 *
 * @param {string} playlistid - The ID of the playlist to fetch.
 * @returns {Promise<Object|null>} A Promise that resolves to the fetched playlist data as an object or null if an error occurs.
 */
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
        console.log("FETCHED: ");
        console.log(playlistData);
        return playlistData;
    } catch (error) {
        console.log(error);
        return null;
    }
}
/**
 * Generates an HTML card for a track with provided information.
 * This function creates an HTML card element representing a track, including its name, artists, duration, album,
 * track ID, and an audio player for the track. It also includes a button to add the track to a playlist.
 * @param {string} trackname - The name of the track.
 * @param {string} artists - The artists associated with the track.
 * @param {string} duration - The duration of the track.
 * @param {string} albumname - The name of the album to which the track belongs.
 * @param {string} trackid - The Spotify ID of the track.
 * @param {string} trackurl - The URL of the audio track.
 * @param {string} year - The year of the track.
 * @returns {string} An HTML card element representing the track.
 */
function generateCards(trackname, artists, duration, albumname, trackid, trackurl,year) {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistID = urlParams.get("id");
    var song={
        id:trackid,
        title:trackname,
        artist:artists,
        duration:duration,
        year:year,
        album:albumname,
        playlistID:playlistID,
        owner_id:localStorage.getItem("_id")
    }
    song=JSON.stringify(song).replace(/"/g, '&quot;').replace(/'/g, '')
    const trackCard = `
    <div class="col-sm-6 mb-3">
        <div class="card">
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
    </div>
`;
    console.log("WTF");
    return trackCard;

}

/**
 * Adds a song to a playlist.
 *
 * This function sends a PUT request to add a song to a playlist with the specified `playlistID`. The song information
 * is provided in the `song` object, which is expected to be in JSON format and should include attributes such as
 * `id`, `title`, `artist`, `duration`, `year`, `album`, `playlistID`, and `owner_id`.
 *
 * @param {string} playlistID - The ID of the playlist to which the song will be added.
 * @param {string} song - A JSON string representing the song's information.
 */
async function addSong(playlistID,song){
    song = JSON.parse(song);
    try {
        const response = await fetch(`/addsongtoplaylist/${playlistID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(song)
        });
    
        if (response.ok) {
            alert("Song added successfully");
            window.location.href = "/src/html/editplaylist.html?id=" + playlistID;
        } else {
            if (response.status === 400) {
                const responseBody = await response.text();
                if (responseBody === 'EXISTS') {
                    alert("Song is already in the playlist!");
                } else {
                    alert("An error occurred while adding the song to the playlist. Please try again later.");
                }
            } else {
                alert("An error occurred while adding the song to the playlist. Please try again later.");
            }
        }
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        alert("An error occurred while adding the song to the playlist. Please try again later.");
    }
    
}
