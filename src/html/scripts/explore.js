let hasImages = (item) => Object.values(item).length > 0;

var queryCached = '';
var cachedType = 'Track';
var [ pageResults, offsetCached ] = [ 0, 0 ];
const itemsPerPage = 20;



function prevResults(filter, query) {
   if (pageResults > 0) {
      pageResults -= 1
      offsetCached = (offsetCached - itemsPerPage >= 0) ? offsetCached - itemsPerPage : 0;
      getItems(filter, query, offsetCached)
   }
   // console.log(pageResults, offset);
}

function nextResults(filter, query) {
   pageResults += 1
   offsetCached += itemsPerPage;
   getItems(filter, query, offsetCached)
   // console.log(pageResults, offset);
}


let getItemInfo = (item) => {
   // console.log(item);
   let itemInfo = {};
   itemInfo.id = item.id;

   switch (item.type) {
      case 'track':
         // console.log("Track: ", item);
         itemInfo.name = item.name;
         itemInfo.cardText = (Object.values(item.artists).lenght > 1) ? item.artists.map((artist) => {artist.name }).join(", ") : item.artists[0].name;
         itemInfo.secondBodyText = (Object.values(item.duration_ms) > 0) ?  msToTime(item.duration_ms) : "";

         if (hasImages(item.album.images)) {
            itemInfo.img = item.album.images[0].url;
         } else {
            itemInfo.img = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
         }

         itemInfo.audioSrc = item.preview_url != null ? item.preview_url : "";
         break;

      case 'artist':
         // console.log("Artist: ", item);
         itemInfo.name = item.name;
         itemInfo.cardText = item.genres?.map((genre) =>  genre).join(", ");
         itemInfo.secondBodyText = (Object.values(item.popularity) > 0) ? `Popularity: ${item.popularity}` : "";

         if (hasImages(item.images)) {
            itemInfo.img = item.images[0].url;
         } else {
            itemInfo.img = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
         }
         break;

      case 'album':
         // console.log("Album: ", item);
         itemInfo.name = item.name;
         itemInfo.cardText = item.artists?.map((artist) =>  artist.name).join(", ");
         itemInfo.secondBodyText =(Object.values(item.release_date) !== "") ? `Release Date: ${item.release_date}` : "";

         if (hasImages(item.images)) {
            itemInfo.img = item.images[0].url;
         } else {
            itemInfo.img = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
         }
         break;

      default: return null;
   }
   return itemInfo;
}


const createPlaylistsOption = (trackId, playlists) => {
   if (Object.values(playlists).length == 0) { return null };

   let playlistOptions = "";
   for (i in playlists) {
      // console.log(i);
      // let playlist = playlists[i].title;
      let trackPlaylistObj = JSON.stringify({tid: trackId, pid: playlists[i]._id});
      playlistOptions += `<a class="dropdown-item" onClick='addToPlaylist(${trackPlaylistObj})'>${playlists[i].title}</a>`
   }
   return playlistOptions;
}

async function populateCards(data, page) {
   let fetchedItems = () => {
      if (data.tracks?.items != undefined) {
         return data.tracks?.items
      } else if (data.artists?.items != undefined) {
         return data.artists?.items
      } else if (data.albums?.items != undefined) {
         return data.albums?.items
      }
   };
   // console.log(fetchedItems());
   // console.log("DATA:", fetchedItems());

   let card = document.getElementById("card-track")
   let container = document.getElementById("container-track")
   container.innerHTML = ""
   container.append(card)

   let playlists = null;
   if (localStorage.getItem('_id')) {
      playlists = await fetchPlaylists();
   }

   for (let i in fetchedItems()) {
      let currentItem = fetchedItems()[i];
      // console.log(currentItem);
      let itemInfo = getItemInfo(currentItem);

      let clone = card.cloneNode(true)
      clone.id = 'card-track-' + i;
      let trackId = currentItem.id;

      clone.getElementsByClassName('card-title')[0].innerHTML = itemInfo.name;

      clone.getElementsByClassName('card-text')[0].innerHTML = itemInfo.cardText;

      clone.getElementsByClassName('card-img-top')[0].src = itemInfo.img;

      clone.getElementsByClassName('text-body-secondary')[0].innerHTML = itemInfo.secondBodyText;

      clone.getElementsByClassName('img-responsive')[0].src = itemInfo.img;

      clone.getElementsByClassName('modal')[0].setAttribute('id', 'trackModal' + trackId);
      clone.getElementsByClassName('modal-title')[0].setAttribute('id', 'trackModalLabel' + trackId);
      clone.getElementsByClassName('modal-footer')[0].setAttribute('id', 'trackModalFooter' + trackId);

      clone.getElementsByClassName('btn-close')[0].setAttribute('data-dismiss', 'trackModal' + trackId);

      clone.getElementsByClassName('btn')[0].setAttribute('data-toggle', 'modal');
      clone.getElementsByClassName('btn')[0].setAttribute('data-target', '#trackModal' + trackId);

      let itemToPass = JSON.stringify(itemInfo);
      clone.getElementsByClassName('btn')[0].setAttribute('onClick', `showTrackInfo(${itemToPass})`);

      clone.getElementsByClassName('dropdown-menu')[0].setAttribute('id', 'playlistSelect' + trackId);

      let playlistsOptions = playlists && Object.values(playlists).length > 0 ? createPlaylistsOption(trackId, playlists) : null;
      if (playlistsOptions == null) {
         clone.getElementsByClassName('dropdown-toggle')[0].disabled = true;
         clone.getElementsByClassName('dropdown-toggle')[0].hidden = true;
         clone.getElementsByClassName('dropdown-toggle')[0].className = "btn btn-outline-secondary dropdown-toggle";
         clone.getElementsByClassName('dropdown-toggle')[0].innerText = `No playlists.`
      } else {
         clone.getElementsByClassName('dropdown-toggle')[0].disabled = false;
         clone.getElementsByClassName('dropdown-toggle')[0].hidden = false;
         clone.getElementsByClassName('dropdown-menu')[0].innerHTML += `${playlistsOptions}`;
      }

      // clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('id', 'dropdownPlaylist' + trackId);
      clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('data-bs-target', '#playlistSelect' + trackId);

      clone.classList.remove('d-none');

      card.before(clone);
      // Debugging: limit to 4 elements
      // if (i == 3) break;
   }

}


async function populatePublicPlaylistCards(data) {
   let container = document.getElementById("container-items");
   container.innerHTML = `
<div class="container">
   <br><br>
   <h2 style="text-align:center;">Public Playlists</h2>
   <div class="row" id="playlistPublicContainer">
      <!-- Card are dynamically created -->
   </div>
</div>
<div class="modal fade custom-modal-xl" id="songsModal" tabindex="-1" aria-labelledby="songsModalLabel"
   aria-hidden="true">
   <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
         <div class="modal-header">
            <h5 class="modal-title" id="songsModalLabel">Your songs</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
            <table class="table">
               <thead>
                  <tr>
                     <th scope="col">Title</th>
                     <th scope="col">Artists</th>
                     <th scope="col">Album</th>
                     <th scope="col">Genres</th>
                     <th scope="col">Duration</th>
                     <th scope="col">Year</th>
                  </tr>
               </thead>
               <tbody id="songsTableBody">
                  <!-- Songs will be added here dinamically -->
               </tbody>
            </table>
         </div>
      </div>
   </div>
</div>
`;

   const playlistContainer = document.getElementById("playlistPublicContainer");

   data.playlists.forEach(playlist => {
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
<button class="btn btn-primary" onclick="importPublicPlaylist('${playlist._id}')">
Import playlist
</button>

</div>
</div>
</div>
`;
      playlistContainer.innerHTML += card;
   });
   /*
   let playlists = null;
   if (localStorage.getItem('_id')) {
      playlists = await fetchPlaylists();
   }

   for (let i in fetchedItems()) {
      let currentItem = fetchedItems()[i];
      console.log(currentItem);
      let itemInfo = getItemInfo(currentItem);

      let clone = card.cloneNode(true)
      clone.id = 'card-track-' + i;
      let trackId = currentItem.id;

      clone.getElementsByClassName('card-title')[0].innerHTML = itemInfo.name;

      clone.getElementsByClassName('card-text')[0].innerHTML = itemInfo.cardText;

      clone.getElementsByClassName('card-img-top')[0].src = itemInfo.img;

      clone.getElementsByClassName('text-body-secondary')[0].innerHTML = itemInfo.secondBodyText;

      clone.getElementsByClassName('img-responsive')[0].src = itemInfo.img;

      clone.getElementsByClassName('modal')[0].setAttribute('id', 'trackModal' + trackId);
      clone.getElementsByClassName('modal-title')[0].setAttribute('id', 'trackModalLabel' + trackId);
      clone.getElementsByClassName('modal-footer')[0].setAttribute('id', 'trackModalFooter' + trackId);

      clone.getElementsByClassName('btn-close')[0].setAttribute('data-dismiss', 'trackModal' + trackId);

      clone.getElementsByClassName('btn')[0].setAttribute('data-toggle', 'modal');
      clone.getElementsByClassName('btn')[0].setAttribute('data-target', '#trackModal' + trackId);

      let itemToPass = JSON.stringify(itemInfo);
      clone.getElementsByClassName('btn')[0].setAttribute('onClick', `showTrackInfo(${itemToPass})`);

      clone.getElementsByClassName('dropdown-menu')[0].setAttribute('id', 'playlistSelect' + trackId);

      let playlistsOptions = playlists && Object.values(playlists).length > 0 ? createPlaylistsOption(trackId, playlists) : null;
      if (playlistsOptions == null) {
         clone.getElementsByClassName('dropdown-toggle')[0].disabled = true;
         clone.getElementsByClassName('dropdown-toggle')[0].hidden = true;
         clone.getElementsByClassName('dropdown-toggle')[0].className = "btn btn-outline-secondary dropdown-toggle";
         clone.getElementsByClassName('dropdown-toggle')[0].innerText = `No playlists.`
      } else {
         clone.getElementsByClassName('dropdown-toggle')[0].disabled = false;
         clone.getElementsByClassName('dropdown-toggle')[0].hidden = false;
         clone.getElementsByClassName('dropdown-menu')[0].innerHTML += `${playlistsOptions}`;
      }

      // clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('id', 'dropdownPlaylist' + trackId);
      clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('data-bs-target', '#playlistSelect' + trackId);

      clone.classList.remove('d-none');

      card.before(clone);
      // Debugging: limit to 4 elements
      // if (i == 3) break;
   }
   */

}

function showTrackInfo(info) {
   let string = JSON.stringify(info);
   let item = JSON.parse(string);

   if (!item.id) {
      alert("Error getting information about selected item.\nRetry.");
      return;
   }

   const modal = new bootstrap.Modal(document.getElementById('trackModal' + item.id));
   let modalLabel = document.getElementById('trackModalLabel' + item.id);

   let cardText = item.cardText || null;
   if (cardText) {
      modalLabel.innerHTML = `
<h2>${item.cardText}: ${item.name}</h2>
<h4 style="color: grey">${item.secondBodyText}</h4>
`;
   } else {
      modalLabel.innerHTML = `
<h2>${item.name}</h2>
<h4 style="color: grey">${item.secondBodyText}</h4>
`;
   }

   let hasPreviewUrl = item.audioSrc || null;
   if (hasPreviewUrl) {
      let modalFooter = document.getElementById('trackModalFooter' + item.id);
      modalFooter.innerHTML = `
<div class="audio-player">
   <audio controls class="custom-audio-player">
      <source src=${hasPreviewUrl} type="audio/mpeg">
         Il tuo browser non supporta l'elemento audio.
   </audio>
</div>
`;
   }

   modal.show();
}


function getItems(type, query, offset) {

   let q = query || null;
   let t = type || 'Track';
   let o = offset || 0;

   if ((t != cachedType) || (q != queryCached)) offsetCached = 0;

   try {
      switch (t) {
         case 'Playlist' || 'Playlists':
            fetch(`/playlists`)
               .then(response => {
                  if (!response.ok) {
                     response.json().then(data => console.error(data.status_message))
                     return
                  }
                  response.json().then(data => {
                     // console.log(data);
                     populatePublicPlaylistCards({ playlists: data })
                  })
               })

            break;

         default:
            fetch(`/search?q=${q}&type=${t}&offset=${o}`)
               .then(response => {
                  if (!response.ok) {
                     response.json().then(data => console.error(data.status_message))
                     return
                  }
                  response.json().then(data => {
                     // console.log(data);
                     populateCards(data);
                  })
               })
            break;
      }
   } catch (err) {
      console.error(err)
      // retry if fetch error
      setTimeout(() => {
         getItems(type, query);
      }, 1000);
   }

}


function addToPlaylist(trackIdToAddToPlaylist) {
   let strObj = JSON.stringify(trackIdToAddToPlaylist);
   let { tid, pid } = JSON.parse(strObj);

   let userId = localStorage.getItem('_id');
   if (!userId) {

      const msg = `
Attention
You need an account to add song to playlist!
Register to the app or press 'OK' to create a new account.
`
      if (window.confirm(msg)) {
         window.location.replace('/profile');
      }
      return;
   } else {
      fetch(`/tracks/${tid}`).then((response) => {
         if (response.ok) {
            response.json().then((trackData) => {
               let duration = msToTime(trackData.duration_ms);
               trackData.duration_ms = duration;

               fetch(`/playlist/${pid}`, {
                  method: 'PUT',
                  headers: {
                     'Content-Type': 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({ track: trackData, pid: pid })
               })
            })
         }
      })
   }

}


function importPublicPlaylist(pid) {
   console.log("playlist_id", pid);

   // TODO: to change the message, I can't think about it right now!!! 😅
   let msg = `
Do you want to import this playlist to your personal list?
`;
   if (window.confirm(msg)) {
      fetch(`/getplaylist/${pid}`).then((response) => {
         if (response.ok) {
            response.json().then((playlistData) => {
               console.log(playlistData);
               delete playlistData._id;
               playlistData.owner_id = localStorage.getItem('_id');
               playlistData.private = false;
               console.log(playlistData);
               fetch('/createplaylist', {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json"
                  },
                  body: JSON.stringify(playlistData)
               }).then(async response => {
                     if (response.ok) {
                        alert("Playlist created successfully");
                        setTimeout(function () {
                           window.location.replace('/playlist');
                        }, 500);
                     }
                     else {
                        alert("Error importing playlist!");
                     }
                  });
            })
         }
      })
   }
}
