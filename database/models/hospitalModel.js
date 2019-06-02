const mongoose = require('mongoose')

let hospitalSchema = mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' })

module.exports = mongoose.model('Hospital', hospitalSchema)