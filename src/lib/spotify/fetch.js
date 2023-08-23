/*
 * Helper function to communicate with Spotify API
 * with authorization token
 */

import { config, spotify, mongodb } from '../../config/prefs.js';
const BASE_URL = spotify.base_url
console.log(BASE_URL)

/**
   * Wrapper function to query Spotify API,
   * fetching given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const fetchSpotify = async (URL, token) => {
   try {
      const response = await fetch(URL, {
         method: 'GET',
         headers: {
            Authorization: `Bearer ${token}`
         }
      });

      if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error('An error occurred:', error);
      throw error; // Rilancia l'errore per gestirlo nel chiamante
   }
}


/**
   * Query Spotify API to get tracks
   * @param {string} URL used for fetch
   * @param {string} searchQuery token used for authorization
   * @returns {Promise} fetchSpotify
   */
const getTrack = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=track`

   fetchSpotify(url, token)
}

/**
   * Query Spotify API to get albums
   * @param {string} token token to use for authorization
   * @param {string} searchQuery name of the album
   * @returns {Promise}
   */
const getAlbums = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album`

   fetchSpotify(url, token)
}

/**
   * Query Spotify API to get artists
   * @param {string} token token to use for authorization
   * @param {string} searchQuery name of the artist
   * @returns {Promise}
   */
const getArtists = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=artist`

   fetchSpotify(url, token)
}

/**
   * Fetch all genres available
   * @param {string} token token to use for authorization
   * @returns {Promise}
   */
const getGenres = async (res,token) => {
   if (token == null) {
      token = await getAccessToken();
   }
   const url = spotify.base_url+`/recommendations/available-genre-seeds`

   const ret=await fetchSpotify(url, token);
   console.log(ret);
   res.json(ret);
   
}


/**
 * Ottiene l'access token per l'autenticazione alle API di Spotify utilizzando il metodo client_credentials.
 *
 * @returns {Promise<string>} L'access token ottenuto dalla richiesta.
 * @throws {Error} Se si verifica un errore durante la richiesta o la conversione JSON.
 */
const getAccessToken = async () => {
   try {
      // Ottiene le credenziali dal file di configurazione
      const client_id = spotify.client_id;
      const client_secret = spotify.client_secret;

      // Effettua una richiesta POST per ottenere l'access token
      const response = await fetch(spotify.token_url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
         },
         body: 'grant_type=client_credentials'
      });

      // Converte la risposta in formato JSON
      const data = await response.json();

      // Restituisce l'access token ottenuto
      return data.access_token;
   } catch (error) {
      // Gestisce eventuali errori e li rilancia
      console.error('An error occurred:', error);
      throw error;
   }
}


/**
   * Query Spotify API to get recommendations
   * @param {string} token token to use for authorization
   * @param {string} artists artist to be used as seed to get recommendations
   * @param {string} genres genres to be used as seed to get recommendations
   * @returns {Promise}
   */
const getRecommended = async (token, artists, genres) => {
   const url = `${BASE_URL}/recommendations?seed_artists=${artists}&seed_genres=${genres}`

   fetchSpotify(url, token)
}

/**
   * Query Spotify API to get all matching given query
   * @param {string} token to be used for authorization
   * @param {string} searchQuery to match with albums, artists or tracks
   * @returns {Promise}
   */
const getAll = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album,artist,track`

   fetchSpotify(url, token)
}


export {
   BASE_URL,
   fetchSpotify,
   getAll,
   getTrack,
   getAlbums,
   getArtists,
   getGenres,
   getRecommended
}
