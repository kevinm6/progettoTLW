// TODO: move to < config/prefs.js > file ??

const apiKey = require('../config/prefs').auth_apikey;

function auth(req, res, next) {
    if (req.query.apikey != apiKey) {
      res.status(401)
      return res.json({ message: "Invalid API key" })
    }

    next()
  }

module.exports = { auth }
