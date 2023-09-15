import crypto from "crypto";
import { ObjectId } from "mongodb";
/**
 * Get hash (md5) from current input.
 *
 * @param {string} input - input to be encrypted
 * @returns {string} hash of md5 algorithm applied to given input
 */
export function hash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
} 

export async function songExistsInPlaylist(collection,playlistID, songData) {
    try {
      const filter = {
        _id: new ObjectId(playlistID),
        'songs.id': songData.id,
        owner_id: new ObjectId(songData.owner_id)
      };
  
      const existingSong = await collection.findOne(filter);
      return !!existingSong;
    } catch (error) {
      console.error(`Error checking if song exists in playlist: ${error}`);
      return false; // Assume the song doesn't exist on error
    }
  }
  