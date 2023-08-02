/*
 * Helper function to communicate with Spotify API
 * with authorization token
 */

import spotify from "../../config/prefs";
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
   return await fetch(URL, {
      method: 'GET',
      headers: {
         Authorization: `Bearer ${token}`
      }
   })
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
const getGenres = async (token) => {
   const url = `${BASE_URL}/recommendations?available-genre-seeds`

   fetchSpotify(url, token)
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


module.exports = {
   BASE_URL,
   fetchSpotify,
   getAll,
   getTrack,
   getAlbums,
   getArtists,
   getGenres,
   getRecommended
}
