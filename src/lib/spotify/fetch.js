/*
 * Helper function to communicate with Spotify API
 * with authorization token
 */

import { spotify } from '../../config/prefs.js';
import { generateSpotifyToken } from './token.js';
const BASE_URL = spotify.base_url

/**
   * Wrapper function to query Spotify API,
   * fetching given URL with authorization token
   * @param {string} url to use for fetch
   * @returns {Object}
   */
const fetchSpotify = async (URL) => {
   /* Token verification */
   let token = process.env.SPOTIFY_TOKEN;
   if (token == null) token = await generateSpotifyToken();

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
   * @returns {Object}
   */
const getTrack = async (searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=track`
   const track = await fetchSpotify(url);

   return track;
}


/**
   * Query Spotify API to get albums
   * @param {string} searchQuery name of the album
   * @returns {Object}
   */
const getAlbums = async (searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album`
   const albums = await fetchSpotify(url);

   return albums;
}

/**
  * Query Spotify API to get artists
  * @param {string} searchQuery name of the artist
  * @returns {Object}
  */
const getArtists = async (searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=artist`
   const artists = await fetchSpotify(url);

   return artists;
}

/**
  * Fetch all genres available
  * @returns {Promise}
  */
const getGenres = async (res) => {
   const url = spotify.base_url+`/recommendations/available-genre-seeds`

   const ret = await fetchSpotify(url);
   console.log(ret);
   res.json(ret);
}


/**
  * Query Spotify API to get recommendations
  * @param {string} artists artist to be used as seed to get recommendations
  * @param {string} genres genres to be used as seed to get recommendations
  * @returns {Promise}
  */
const getRecommended = async (artists, genres) => {
   const url = `${BASE_URL}/recommendations?seed_artists=${artists}&seed_genres=${genres}`
   const recommended = await fetchSpotify(url);

   return recommended
}

/**
   * Query Spotify API to get all matching given query
   * @param {string} searchQuery to match with albums, artists or tracks
   * @returns {Promise}
   */
const getAll = async (searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album,artist,track`
   const all = await fetchSpotify(url);

   return all
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
