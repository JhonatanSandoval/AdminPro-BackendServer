// requires
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


// variables
let app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const fileupload = require('express-fileupload')
app.use(fileupload())

// CORS
const cors = require('cors')
app.use(cors())


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

const hospitalRoutes = require('./routes/hospital')
app.use('/hospitales', hospitalRoutes)

const medicoRoutes = require('./routes/medico')
app.use('/medicos', medicoRoutes)

const busquedaRoutes = require('./routes/busqueda')
app.use('/busqueda', busquedaRoutes)

const uploadRoutes = require('./routes/upload')
app.use('/upload', uploadRoutes)

const imgsRoutes = require('./routes/imagenes')
app.use('/img', imgsRoutes)


// listen/open server
const port = 3000
app.listen(port, () => {
  console.log('express server port ===>', port);
})