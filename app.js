const mongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
// const auth = require('./auth').auth
const crypto = require('crypto')
var cors = require('cors')
const express = require('express')
const path = require('path')
const prefs = require('./src/config/prefs')


// TODO: For now is just a semi-skeleton for what we need to do!

const app = express()
app.use(cors())
// app.use(auth) // Per avere apikey su tutti gli endpoint
app.use(express.json())

function hash(input) {
  return crypto.createHash('md5').update(input).digest('hex')
}
app.get('/users/:id', auth, async function(req, res) {
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

async function addUser(res, user) {
  if (user.name == undefined) {
    res.status(400).send('Missing Name')
    return
  }
  if (user.surname == undefined) {
    res.status(400).send('Missing Surname')
    return
  }
  if (user.email == undefined) {
    res.status(400).send('Missing Email')
    return
  }
  if (user.password == undefined || user.password.length < 3) {
    res.status(400).send('Password is missing or too short')
    return
  }
  if (user.date == undefined) {
    res.status(400).send('Date is missing or too short')
    return
  }

  user.password = hash(user.password)

  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  try {
    var items = await pwmClient.db('pwm').collection('users').insertOne(user)
    res.json(items)
  } catch (e) {
    console.log('catch in test')
    if (e.code == 11000) {
      res.status(400).send('Utente già presente')
      return
    }
    res.status(500).send(`Errore generico: ${e}`)
  }
}
function deleteUser(res, id) {
  let index = users.findIndex((user) => user.id == id)
  if (index == -1) {
    res.status(404).send('User not found')
    return
  }
  users = users.filter((user) => user.id != id)
  res.json(users)
}

async function updateUser(res, id, updatedUser) {
  if (updatedUser.name == undefined) {
    res.status(400).send('Missing Name')
    return
  }
  if (updatedUser.surname == undefined) {
    res.status(400).send('Missing Surname')
    return
  }
  if (updatedUser.email == undefined) {
    res.status(400).send('Missing Email')
    return
  }
  if (updatedUser.password == undefined) {
    res.status(400).send('Missing Password')
    return
  }
  updatedUser.password = hash(updatedUser.password)
  try {
    var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()

    var filter = { _id: new ObjectId(id) }

    var updatedUserToInsert = {
      $set: updatedUser,
    }

    var item = await pwmClient
      .db('pwm')
      .collection('users')
      .updateOne(filter, updatedUserToInsert)
    res.send(item)
  } catch (e) {
    console.log('catch in test')
    if (e.code == 11000) {
      res.status(400).send('Utente già presente')
      return
    }
    res.status(500).send(`Errore generico: ${e}`)
  }
}

async function addFavorites(res, id, movie_id) {
  try {
    var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()

    var filter = { user_id: new ObjectId(id) }

    var favorite = {
      $push: { movie_ids: movie_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await pwmClient
      .db('pwm')
      .collection('preferiti')
      .updateOne(filter, favorite)

    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}

async function removeFavorites(res, id, movie_id) {
  try {
    var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()

    var filter = { user_id: new ObjectId(id) }

    var favorite = {
      $pull: { movie_ids: movie_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await pwmClient
      .db('pwm')
      .collection('preferiti')
      .updateOne(filter, favorite)
    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}

app.get('/users', auth, async function(req, res) {
  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  var users = await pwmClient
    .db('pwm')
    .collection('users')
    .find()
    .project({ password: 0 })
    .toArray()
  res.json(users)
})

app.post('/users', auth, function(req, res) {
  addUser(res, req.body)
})

app.get('/login', async (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'))
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

app.put('/users/:id', auth, function(req, res) {
  updateUser(res, req.params.id, req.body)
})

app.delete('/users/:id', auth, function(req, res) {
  deleteUser(res, req.params.id)
})

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/favorites/:id', async (req, res) => {
  // Ricerca nel database
  var id = req.params.id
  var pwmClient = await new mongoClient(prefs.mongodb.uri).connect()
  var favorites = await pwmClient
    .db('pwm')
    .collection('preferiti')
    .findOne({ user_id: new ObjectId(id) })
  res.json(favorites)
})

app.post('/favorites/:id', async (req, res) => {
  // Ricerca nel database
  var id = req.params.id
  movie_id = req.body.movie_id
  console.log(movie_id)
  console.log(id)
  addFavorites(res, id, movie_id)
})

app.delete('/favorites/:id', async (req, res) => {
  // Ricerca nel database
  var id = req.params.id
  movie_id = req.body.movie_id
  console.log(movie_id)
  console.log(id)
  removeFavorites(res, id, movie_id)
})

app.listen(prefs.port, prefs.listen_on, () => {
  console.log(`Server listening on port: ${prefs.port}`)
})
