import crypto from "crypto";
import fs from 'fs';
import path from 'path';
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

export async function songExistsInPlaylist(collection, playlistID, songData) {
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

export function isValidString(string) {
  // Verifica se la stringa è definita e non è una stringa vuota
  if (string === undefined || string === null || typeof string !== 'string' || string.trim() === '') {
    return false;
  }
  return true;
}
export function isValidDate(string) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!string || !dateRegex.test(string)) {
    return false;
  }
  const dateParts = string.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  const isValidYear = year >= 1000 && year <= 9999;
  const isValidMonth = month >= 1 && month <= 12;
  const isValidDay = day >= 1 && day <= new Date(year, month, 0).getDate();

  return isValidYear && isValidMonth && isValidDay;
}
export function isValidPassword(password){
  return isValidString(password) && password.length >= 7;
}
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function parseTags(tags) {
  if (!tags) {
     return [];
  }
  const tagArray = tags.split(',').map(tag => tag.trim());
  return tagArray;
}

export function isValidNickname(nickname) {
  if (typeof nickname !== 'string') {
     return false;
  }
  if (nickname.length > 16 || nickname.length<4) {
     return false;
  }
  if (nickname.includes(' ')) {
     return false;
  }
  return true;
}

/* UTILS FOR SONGS */

export function isValidYear(year) {
  const yearPattern = /^(\d{4}(-\d{2}(-\d{2})?)?|\d{2}-\d{2}-\d{4})$/;
  return yearPattern.test(year);
}
export function isValidDuration(duration) {
  const durationPattern = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
  return durationPattern.test(duration);
}
export function isValidAlbum(duration) {
  return isValidString(duration);
}
export function isValidArtist(artists) {
  return isValidString(artists);
}
/* UTILS FOR PLAYLISTS */
export function isValidPlaylistTitle(playlisttitle){
  return isValidString(playlisttitle);
}
export function isValidPlaylistDescription(playlistdescription){
  return isValidString(playlistdescription);
}
export function isValidPrivacy(privacy) {
  return typeof privacy === 'boolean';
}
export function isValidTags(tags){
  if (!Array.isArray(tags)) {
    return false; // not an array
  }
  for (const artist of tags) {
    if (typeof artist !== 'string') {
      return false; // if even one element is not string
    }
  }
  return true;   
}

/** LOGGING UTILS */
export function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}]: ${message}\n`;
  var stream = fs.createWriteStream("serverlogs/serverlogs.log", {flags:'a'});
  stream.write(logMessage);
  console.log(logMessage);
}
export function logonly(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}]: ${message}\n`;
  var stream = fs.createWriteStream("serverlogs/serverlogs.log", {flags:'a'});
  stream.write(logMessage);
}

export function createLogFolder(){
  const logDir = 'serverlogs';
  const logFile = 'serverlogs/serverlogs.log';

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
      console.log("LOGGING FOLDER CREATED");
    }

    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, ''); // Crea il file vuoto serverlogs.log
      console.log("LOGGING FILE CREATED");
    }
  } catch (err) {
    console.error(err);
  }
}

