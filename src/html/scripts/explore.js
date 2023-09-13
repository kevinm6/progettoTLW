let hasImages = (item) => Object.values(item).length > 0;

var [ pageResults, offset ] = [ 0, 0 ];

function prevResults(filter, query) {
   if (pageResults > 0) {
      pageResults -= 1
      offset = (offset - 20 >= 0) ? offset - 20 : 0;
      getItems(filter, query, offset)
   }
   console.log(pageResults, offset);
}

function nextResults(filter, query) {
   pageResults += 1
   offset += 20;
   getItems(filter, query, offset)
   console.log(pageResults, offset);
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

async function populateCards(data, page) {
   // TODO:
   //    - add always more item + button "more"
   //       - see offset || previous -> https://developer.spotify.com/documentation/web-api/reference/search
   //    - refactor?

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

   let card = document.getElementById("card-track")
   let container = document.getElementById("container-track")
   container.innerHTML = ""
   container.append(card)

   let playlists = await fetchPlaylists();

   let playlistOptions = "";
   for (i in playlists) {
      let playlist = playlists[i].title;
      playlistOptions += `<a class="dropdown-item" onClick='addToPlaylist("pid":"${playlists[i]._id}"})'>${playlist}</a>`
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


      let addTrackToPlaylistFunction =  playlistOptions.replace(/addToPlaylist\(/g, `addToPlaylist({"tid":"${trackId}",`);
      clone.getElementsByClassName('dropdown-menu')[0].innerHTML += `${addTrackToPlaylistFunction}`;

      // clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('id', 'dropdownPlaylist' + trackId);
      clone.getElementsByClassName('dropdown-toggle')[0].setAttribute('data-bs-target', '#playlistSelect' + trackId);

      clone.classList.remove('d-none');

      card.before(clone);
      // Debugging: limit to 4 elements
      // if (i == 3) break;
   }

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
   console.log("CALLING getItems: ", type, query);
   try {
      fetch(`/search?q=${query}&type=${type}&offset=${offset}`)
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
   } catch (err) {
      console.error(err)
      // retry if fetch error
      setTimeout(() => {
         getItems(type, query);
      }, 1000);
   }

}


function addToPlaylist(trackIdToAddToPlaylist) {

   let { tid, pid } = trackIdToAddToPlaylist;

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

