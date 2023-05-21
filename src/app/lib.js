// TODO: modify for Spotify
//       and move all sensitive info into < config/prefs.js > file

const prefs = require('../config/prefs');
const BASE = prefs.spotify.base_url
const image_base_url = prefs.spotify.image_base_url
const LANG = prefs.spotify.lang

const API_KEY = prefs.spotify.apikey

var page = 1
var pageCast = 0

function prev() {
  if (page > 1) {
    page = page - 1
    getPopolari(page)
  }
}

function next() {
  if (page < 1000) {
    page = page + 1
    getPopolari(page)
  }
}

function prevCast() {
  if (pageCast > 0) {
    pageCast = pageCast - 1
    getCredits(id, pageCast)
  }
}

function nextCast() {
  pageCast = pageCast + 1
  getCredits(id, pageCast)
}

function mostraPopolari(popolari) {
  var card = document.getElementById('card-film')
  var container = document.getElementById('container-film')
  container.innerHTML = ''
  container.append(card)

  for (var i = popolari.results.length - 1; i >= 0; i--) {
    var clone = card.cloneNode(true)

    clone.id = 'card-film-' + i
    clone.getElementsByClassName('card-title')[0].innerHTML =
      popolari.results[i].title
    clone.getElementsByClassName('card-text')[0].innerHTML =
      popolari.results[i].overview
    clone.getElementsByClassName('text-body-secondary')[0].innerHTML =
      popolari.results[i].release_date
    clone.getElementsByClassName('card-img-top')[0].src =
      image_base_url + popolari.results[i].poster_path
    clone.getElementsByClassName('btn')[0].href =
      'scheda-film.html?id_film=' + popolari.results[i].id

    clone.classList.remove('d-none')

    card.after(clone)
  }
}

function mostraFilm(film) {
  console.log(film)
  document.getElementById('card-title').innerHTML = film.title
  document.getElementById('card-overview').innerHTML = film.overview
  document.getElementById('card-date').innerHTML = film.release_date
  document.getElementById('card-img').src = image_base_url + film.poster_path
}

function getFilm(id) {
  fetch(`${BASE}movie/${id}?${API_KEY}&${LANG}`)
    .then((response) => {
      if (!response.ok) {
        response.json().then((data) => alert(data.status_message))
        return
      }
      response.json().then((film) => mostraFilm(film))
    })
    .catch((error) => alert(error))
}

function getCredits(id, pageCast) {
  fetch(`${BASE}movie/${id}/credits?${API_KEY}&${LANG}`)
    .then((response) => {
      if (!response.ok) {
        response.json().then((data) => alert(data.status_message))
        return
      }
      response.json().then((people) => mostraCast(people, pageCast))
    })
    .catch((error) => alert(error))
}

function mostraCast(people, pageCast) {
  console.log(people)
  var card = document.getElementById('card-cast')
  var container = document.getElementById('container-cast')
  container.innerHTML = ''
  container.append(card)

  for (var i = pageCast * 6; i < (pageCast + 1) * 6; i++) {
    var clone = card.cloneNode(true)

    clone.id = 'card-cast-' + i
    clone.getElementsByClassName('card-text')[0].innerHTML = people.cast[i].name
    clone.getElementsByClassName('text-body-secondary')[0].innerHTML =
      people.cast[i].character
    if (people.cast[i].profile_path != null) {
      clone.getElementsByClassName('card-img-top')[0].src =
        image_base_url + people.cast[i].profile_path
    } else {
      clone.getElementsByClassName('card-img-top')[0].src =
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    }
    clone.getElementsByClassName('btn')[0].href =
      'scheda-attore.html?id_attore=' + people.cast[i].id

    clone.classList.remove('d-none')

    card.before(clone)
  }
}

function getPopolari(page) {
  fetch(`${BASE}movie/popular?${API_KEY}&${LANG}&page=${page}`)
    .then((response) => {
      if (!response.ok) {
        response.json().then((data) => alert(data.status_message))
        return
      }
      response.json().then((popolari) => mostraPopolari(popolari))
    })
    .catch((error) => alert(error))
}

function ricerca(query) {
  console.log(query)

  fetch(`${BASE}search/movie?${API_KEY}&${LANG}&page=${page}&query=${query}`)
    .then((response) => {
      if (!response.ok) {
        response.json().then((data) => alert(data.status_message))
        return
      }
      response.json().then((popolari) => mostraPopolari(popolari))
    })
    .catch((error) => alert(error))
}

function getGuestSessionId() {
  return fetch(`${BASE}authentication/guest_session/new?${API_KEY}`).then(
    (response) => response.json()
  )
}

function vota() {
  voto = document.getElementById('voto').value

  sessionId = getGuestSessionId()

  sessionId.then((json) => {
    sessionId = json.guest_session_id
    rate = {
      value: voto,
    }

    fetch(
      `${BASE}movie/${id}/rating?${API_KEY}&guest_session_id=${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(rate),
      }
    )
  })
}

function getPreferiti() {
  fetch(`${BASE}movie/preferiti?${API_KEY}`)
    .then((response) => {
      if (!response.ok) {
        response.json().then((data) => alert(data.status_message))
        return
      }
      response.json().then((preferiti) => mostraPopolari(preferiti))
    })
    .catch((error) => alert(error))
}

function mostraPreferiti(preferiti) {
  for (var i = preferiti.results.length - 1; i >= 0; i--) {
    clone.id = 'card-film-' + i

    clone.getElementsByClassName('card-title')[0].innerHTML =
      preferiti.results[i].title
    clone.getElementsByClassName('card-text')[0].innerHTML =
      preferiti.results[i].overview
    clone.getElementsByClassName('text-body-secondary')[0].innerHTML =
      preferiti.results[i].release_date
    clone.getElementsByClassName('card-img-top')[0].src =
      image_base_url + preferiti.results[i].poster_path
    clone.getElementsByClassName('btn')[0].href =
      'scheda-film.html?id_film=' + preferiti.results[i].id

    clone.classList.remove('d-none')

    card.after(clone)
  }
}
