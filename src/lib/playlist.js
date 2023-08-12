/* Playlist & Tracks lib functions to manage User */

import crypto from "crypto";
import { config, mongodb } from "./../config/prefs.js";

/**
 * Async function to add song to playlist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param playlist_id - id of the playlist to be updated with new song
 * @param track_id - id of the track to be added to the playlist
 */
export async function addSongToPlaylist(mongoClient, res, playlist_id, track_id) {
  try {

    var filter = { playlist_id: new ObjectId(playlist_id) }

    var favorite = {
      $push: { tracks_ids: track_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await mongoClient
      .db(mongodb.dbName)
      .collection(mongodb.collections.playlists)
      .updateOne(filter, favorite)

    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}

/**
 * Async function to remove song from playlist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param playlist_id - id of the playlist to be updated with new song
 * @param track_id - id of the track to be added to the playlist
 */
export async function removeSongFromPlaylist(mongoClient, res, playlist_id, track_id) {
  try {
    var filter = { playlist_id: new ObjectId(playlist_id) }

    var favorite = {
      $pull: { tracks_ids: track_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await mongoClient
      .db(mongodb.dbName)
      .collection(mongodb.collections.playlists)
      .updateOne(filter, favorite)
    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}
