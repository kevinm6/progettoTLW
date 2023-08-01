const mongoClient = require('mongodb').MongoClient,
   ObjectId = require('mongodb').ObjectId,
   // auth = require('./src/static/auth').auth,
   crypto = require('crypto'),
   swaggerDocument = require("./src/config/swagger_out.json"),
   swaggerUi = require('swagger-ui-express'),
   express = require('express'),
   cors = require('cors'),
   path = require('path'),
   prefs = require('./src/config/prefs');


// TODO: For now is just a semi-skeleton for what we need to do!

const app = express()
app.use(express.json())
app.use(cors())

/* API Docs served by SwaggerUi module */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// app.use(auth) // Per avere apikey su tutti gli endpoint

// HACK: this avoid no-sniff error for loading
app.use(express.static(__dirname))
app.use(express.static(path.join( __dirname, '/src/')))
app.use(express.static(path.join( __dirname, '/src/config/')))
app.use(express.static(path.join( __dirname, '/src/static/')))

function hash(input) {
  return crypto.createHash('md5').update(input).digest('hex')
}
app.get('/users/:id', async function(req, res) {
  // Ricerca nel database
  var id = req.params.id
  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  var user = await pwmClient
    .db('pwm')
    .collection('users')
    .find({ _id: new ObjectId(id) })
    .project({ password: 0 })
    .toArray()
  res.json(user)
})

app.get('/users', async function(req, res) {
  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  var users = await pwmClient
    .db('pwm')
    .collection('users')
    .find()
    .project({ password: 0 })
    .toArray()
  res.json(users)
})

app.post('/users', function(req, res) {
  addUser(res, req.body)
})

app.get('/login', async (req, res) => {
  res.sendFile(__dirname + '/src/html/login.html')
})

app.post('/login', async (req, res) => {
  login = req.body

  if (login.email == undefined) {
    res.status(400).send('Missing Email')
    return
  }
  if (login.password == undefined) {
    res.status(400).send('Missing Password')
    return
  }

  login.password = hash(login.password)

  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  var filter = {
    $and: [{ email: login.email }, { password: login.password }],
  }
  var loggedUser = await pwmClient.db('pwm').collection('users').findOne(filter)
  console.log(loggedUser)

  if (loggedUser == null) {
    res.status(401).send('Unauthorized')
  } else {
    res.json(loggedUser)
  }
})

app.put('/users/:id', function(req, res) {
  updateUser(res, req.params.id, req.body)
})

app.delete('/users/:id', function(req, res) {
  deleteUser(res, req.params.id)
})

app.get('/', function(req, res) {
   // res.setHeader('Content-Type', 'text/html');
   res.sendFile(path.join(__dirname, "/src/html/index.html"));
})

// app.get('/playlists/:id', async (req, res) => {
//   // Ricerca nel database
//   var id = req.params.id
//   var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
//   var favorites = await pwmClient
//     .db('pwm')
//     .collection('playlists')
//     .findOne({ user_id: new ObjectId(id) })
//   res.json(favorites)
// })

// app.post('/playlists/:id', async (req, res) => {
//   // Ricerca nel database
//   var id = req.params.id
//   movie_id = req.body.movie_id
//   console.log(movie_id)
//   console.log(id)
//   addFavorites(res, id, movie_id)
// })

// app.delete('/playlists/:id', async (req, res) => {
//   // Ricerca nel database
//   var id = req.params.id
//   movie_id = req.body.movie_id
//   console.log(movie_id)
//   console.log(id)
//   removeFavorites(res, id, movie_id)
// })

app.listen(prefs.port, prefs.listen_on, () => {
  console.log(`Server listening on port: ${prefs.port}`)
})
