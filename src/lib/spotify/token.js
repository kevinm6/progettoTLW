/**
 * Generate Spotify token and access from other modules
 */
import { spotify } from "../../config/prefs.js";

/**
 * Generate a new Spotify API token
 * @requires {spotify.client_id, spotify.client_secret}
 * @returns {string} token
 */
const generateSpotifyToken = async () => {

   console.log("Generating Spotify token...")

   const basicAuth = new Buffer.from(`${spotify.client_id}:${spotify.client_secret}`).toString('base64')
   const authOptions = {
      method: "POST",
      headers: {
         "Authorization": `Basic ${basicAuth}`,
         "Content-Type": "application/x-www-form-urlencoded"
      },
      body: 'grant_type=client_credentials',
      json: true
   }
   const res = await fetch(spotify.token_url, authOptions)
      // TODO: manage error on creating token and create a timer for renew it
      .then(response => response.json())
      .then(data => {
         var token = data.access_token;
         process.env.SPOTIFY_TOKEN = token;
         window.localStorage.setItem(access_token, token)
      })
   .catch(e => {
         console.error(`Error: ${e}`)
      });
}

export default generateSpotifyToken
