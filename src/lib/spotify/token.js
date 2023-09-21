/**
 * Generate Spotify token and access from API via client_credentials
 */
import { spotify } from "../../config/prefs.js";
import * as utils from "../utils.js";

/**
 * Generate a new Spotify API token.
 * The token is valid for 1 hour, so we need to renew it when it's expired.
 *
 * @requires {spotify.client_id, spotify.client_secret}
 * @return {Promise<string>} Access token given from request
 * @throws {Error} if error occures with the request or json data conversion
 *
 * @see - Spotify Docs
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 */
let scheduled = false;
export const generateSpotifyToken = async () => {
   // NOTE: btoa function is deprecated
   const basicAuth = new Buffer.from(`${spotify.client_id}:${spotify.client_secret}`).toString('base64');
   const authOptions = {
      method: "POST",
      headers: {
         "Authorization": `Basic ${basicAuth}`,
         "Content-Type": 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
   }
   try {
      console.log("📡 Generating Spotify token...")
      utils.logonly("[>>>>>>> TOKEN <<<<<<<<<] GENERATING SPOTIFY TOKEN [>>>>>>> TOKEN <<<<<<<<<]")

      let response = await fetch(spotify.token_url, authOptions)
      const data = await response.json();
      process.env.SPOTIFY_TOKEN = data.access_token;

      if (!scheduled) {
         scheduleRenewSpotifyDevToken();
         scheduled = true;
      }

      return data.access_token;
   } catch (error) {
      console.error(`Generic error: ${error}`);
      scheduled = false;
      throw error;
   };
}


/**
 * Schedule Spotify API generation token for renew it.
 *
 * @returns {string} token
 *
 * @see - Spotify Docs
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 */
const scheduleRenewSpotifyDevToken = async () => {
   console.log("⏱️  Scheduling Spotify Token");
   utils.logonly("[>>>>>>> TOKEN <<<<<<<<<] SCHEDULING SPOTIFY TOKEN [>>>>>>> TOKEN <<<<<<<<<]")
   const anHourInMilliseconds = 3600000;
   setInterval(generateSpotifyToken, anHourInMilliseconds);
}

