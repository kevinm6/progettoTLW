/**
 * Generate Spotify token and access from other modules
 */
import settings from "../../config/prefs";
const url = 'https://accounts.spotify.com/api/token'

/**
 * Generate a new Spotify API token
 * @requires {settings.client_id, settings.client_secret}
 * @returns {String} token
 */
const generateSpotifyToken = async () => {

  console.log(Date.now() + " generating Spotify token")

  const basicAuth = new Buffer.from(`${settings.client_id}:${settings.client_secret}`).toString("base64")

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
  localStorage.setItem()

  return token
}

export { generateSpotifyToken }
