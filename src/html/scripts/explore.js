function populateTracks(data) {
    /* TODO: rename appropriately cards and so on */

    let recommendedTracks = data.tracks.items;

    let card = document.getElementById("card-track")
    let container = document.getElementById("container-track")
    container.innerHTML = ""
    container.append(card)

    let artistsName = (artists) => {
       return artists.map((artist) => artist.name).join(", ");
    }

    for (let i in recommendedTracks) {
       let clone = card.cloneNode(true)

       clone.id = 'card-track-' + i;
       let trackId = recommendedTracks[i].id;

       let title = recommendedTracks[i].name;
       clone.getElementsByClassName('card-title')[0].innerHTML = recommendedTracks[i].name;

       let artists = artistsName(recommendedTracks[i].artists);
       clone.getElementsByClassName('card-text')[0].innerHTML = artists;

       let imgUrl = recommendedTracks[i].album.images[0].url;
       clone.getElementsByClassName('card-img-top')[0].src = imgUrl;

       let durationTime = msToTime(recommendedTracks[i].duration_ms);
       clone.getElementsByClassName('text-body-secondary')[0].innerHTML = durationTime;

       clone.getElementsByClassName('img-responsive')[0].src = imgUrl;

       clone.getElementsByClassName('modal')[0].setAttribute('id', 'trackModal' + trackId);
       clone.getElementsByClassName('modal-title')[0].setAttribute('id', 'trackModalLabel' + trackId);
       clone.getElementsByClassName('modal-body')[0].setAttribute('id', 'trackModalBody' + trackId);

       clone.getElementsByClassName('btn-close')[0].setAttribute('data-dismiss', 'trackModal' + trackId);

       clone.getElementsByClassName('btn')[0].setAttribute('data-bs-toggle', 'modal');
       clone.getElementsByClassName('btn')[0].setAttribute('data-bs-target', '#trackModal' + trackId);
       clone.getElementsByClassName('btn')[0].setAttribute('onClick', `showTrackInfo('${trackId}', '${title}', '${artists}', '${durationTime}')`);

       clone.classList.remove('d-none');

       card.after(clone);
    }

 }

 function showTrackInfo(id, title, artist, body) {
    let modalLabel = document.getElementById('trackModalLabel' + id);
    modalLabel.innerHTML = `
            <h2>${artist}: ${title}</h2>
            <h4 style="color: grey">${body}</h4>`;
 }