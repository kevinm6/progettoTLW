/*
 * Helper function to communicate with Spotify API
 * with authorization token
 */

const BASE_URL = "https://api.spotify.com/v1"

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const fetchSpotify = async (URL, token) => {
   await fetch(URL, {
      method: 'GET',
      headers: {
         Authorization: `Bearer ${token}`
      }
   })
}

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getTrack = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=track`

   return await fetchSpotify(url, token)
}

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getAlbums = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album`

   return await fetchSpotify(url, token)
}

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getArtists = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=artist`

   return await fetchSpotify(url, token)
}

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getGenres = async (token) => {
   const url = `${BASE_URL}/recommendations?available-genre-seeds`

   return await fetchSpotify(url, token)
}

/**
   * Fetch from given URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getRecommended = async (token, artists, genres) => {
   const url = `${BASE_URL}/recommendations?seed_artists=${artists}&seed_genres=${genres}`

   return await fetchSpotify(url, token)
}


/**
   * Fetch all URL with authorization token
   * @param {string} URL to use for fetch
   * @param {string} token to be used for authorization
   * @returns {Promise}
   */
const getAll = async (token, searchQuery) => {
   const url = `${BASE_URL}/search?q=${searchQuery}&type=album,artist,track`

   return await fetchSpotify(url, token)
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
