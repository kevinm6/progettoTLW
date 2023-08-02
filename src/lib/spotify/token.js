/**
 * Generate Spotify token and access from other modules
 */
import spotify from "../../config/prefs.js";

/**
 * Generate a new Spotify API token
 * @requires {spotify.client_id, spotify.client_secret}
 * @returns {string} token
 */
const generateSpotifyToken = async () => {

  console.log(Date.now() + " generating Spotify token")

  const basicAuth = new Buffer.from(`${spotify.client_id}:${spotify.client_secret}`).toString("base64")

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  })

  const { access_token: token } = await res.json()

  // save Spotify token in localStorage
  localStorage.setItem(access_token, token)

   console.log(token)
  return token
}

export default generateSpotifyToken
