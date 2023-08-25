/*
 * Configuration for Server and Database
 * plus config params for Spotify and MongoDB
 */

import 'dotenv/config'
import { resolve } from 'path';

/**
 * Get Application root directory.
 *
 * @returns {string} path of current working directory
 */
const getAppRootDir = () => resolve();


/**
 * Main configs
 * @param {string} host - Host to use as server for NodeJS environment
 * @param {string} port - Port to use for the host if available
 * @param {string} __dirname - set project root directory (based on location of package.json)
 *                              because is not accessible anymore using ES6 modules standard
 *                              instead of CommonJS
 */
const config = {
   host: process.env.HOST,
   port: process.env.PORT,
   __dirname: getAppRootDir(),
};


/**
 * MongoDB config parameters
 * @param {string} database - name/identifier of cluster in MongoDB instance
 * @param {string} dbName - effective database name that store all the informations
 * @param {string} url - connection string to access the above Mongo database;
 *                       using mongodb module in this project
 * @param {{string}} collections - list of all accessible collections of database to work with
 */
const mongodb = {
   database: process.env.DATABASE,
   dbName: process.env.DB_NAME,
   uri: process.env.DB_URI,
   // TODO: others to be added when decided how manage data in Mongo
   collections: {
      users: "users",
      community: "community",
      playlists: "playlists",
      tracks: "tracks"
   }
};

/**
 * Spotify config parameters
 * @param {string} base_url - Base url to use Spotify API
 * @param {string} token_url - Url for generate/refresh Spotify token
 * @param {string} client_id - Identification string of the User/Client
 * @param {string} client_secret - Code for access and use API
 *
 * @usage
 * ```
 * For further reference and usage, visit:
 * https://developer.spotify.com/documentation/web-api/reference
 * ```
 */
const spotify = {
   base_url: process.env.BASE_URL,
   token_url: process.env.TOKEN_URL,
   client_id: process.env.CLIENT_ID,
   client_secret: process.env.CLIENT_SECRET,
};

export { config, spotify, mongodb };
