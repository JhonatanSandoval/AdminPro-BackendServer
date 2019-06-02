// requires
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


// variables
let app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// db connection
const dbName = 'hospitalDB'
mongoose
  .connection
  .openUri('mongodb://localhost:27017/' + dbName,
    (err, res) => {
      if (err) throw err
      console.log('Connected to DB', dbName);

    })


// routes
const appRoutes = require('./routes/app')
app.use('/', appRoutes)

const usuarioRoutes = require('./routes/usuario')
app.use('/usuarios', usuarioRoutes)

const loginRoutes = require('./routes/login')
app.use('/login', loginRoutes)

// listen/open server
const port = 3000
app.listen(port, () => {
  console.log('express server port ===>', port);
})