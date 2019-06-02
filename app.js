// requires
const express = require('express')
const mongoose = require('mongoose')

// variables
let app = express()
const dbName = 'hospitalDB'

// db connection
mongoose
  .connection
  .openUri('mongodb://localhost:27017/' + dbName,
    (err, res) => {
      if (err) throw err
      console.log('Connected to DB', dbName);

    })


// routes
app.get('/', (req, res, next) => {
  res
    .status(200)
    .json({
      success: true,
      mensaje: 'Petición realizada correctamente '
    })
})

// listen/open server
const port = 3000
app.listen(port, () => {
  console.log('express server port ===>', port);
})