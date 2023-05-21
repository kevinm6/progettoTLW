// Configuration for Server and Database

// Main configs
var settings = {
  port: '3000',
  listen_on: '0.0.0.0',
  auth_apikey: '123456'
};

// MongoDB configs
settings.mongodb = {
  host : 'localhost',
  database : 'tlwproject',
  uri: 'mongodb+srv://tlwuser:2BoK4Q6NZhQCNud@tlwproject.tszysxw.mongodb.net/?retryWrites=true&w=majority',
  collections : [
    'users',
    // others to add when decided how manage data in Mongo
  ]
};

// Spotify configs
settings.spotify = {
  base_url : 'https://api.themoviedb.org/3/',
  img_base_url : 'https://image.tmdb.org/t/p/w300',
  lang: 'language=it-IT',
  apikey: 'api_key=siudasubdsdsaadsdsiadasadsuadssa'
};


// HACK: IDK we need to manage this for now, maybe we remove this later
//
// Override default settings
// switch(process.env.NODE_ENV){
//   case 'production':
//     settings.port = 3100;
//   break;
//   case 'staging':
//     settings.port = 3000;
//   break;
// }


// NOTE: decide what to export and expose outside and maybe wrap it
//       around a function call (like encapsulation)
module.exports = settings;
