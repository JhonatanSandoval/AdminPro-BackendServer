const express = require('express')
const app = express()

const fileUpload = require('express-fileupload')
const fs = require('fs')

const usuarioModel = require('../database/models/usuarioModel')
const medicoModel = require('../database/models/medicoModel')
const hospitalModel = require('../database/models/hospitalModel')

app.post('/:tabla/:id', (req, res, next) => {

    const tabla = req.params.tabla,
        _id = req.params.id

    const tablasValidas = ['usuarios', 'medicos', 'hospitales']
    if (tablasValidas.indexOf(tabla) < 0) {
        return res
            .status(400)
            .json({
                success: false,
                mensaje: 'Ha indicado un tipo inválido de la colección',
                error: { message: 'Los tipos válidos deben ser: ' + tablasValidas.join(', ') }
            })
    }

    if (!req.files) {
        return res
            .status(400)
            .json({
                success: false,
                mensaje: 'No ha seleccionado ninguna imagen',
                error: { message: 'Debe seleccionar una imagen ' }
            })
    }

    let archivo = req.files.imagen
    let nombreCortado = archivo.name.split('.')
    let extension = nombreCortado[nombreCortado.length - 1]
    var extensionesValidar = ['png', 'jpg', 'jpeg', 'gif']
    if (extensionesValidar.indexOf(extension) < 0) {
        return res
            .status(400)
            .json({
                success: false,
                mensaje: 'Extensión no válida',
                error: { message: 'Las extensiones válidas son: ' + extensionesValidar.join(', ') }
            })
    }

    // nombre de archivo personalizado
    const nombreArchivo = `${_id}-${new Date().getMilliseconds()}.${extension}`

    // mover el archivo temporal a un path
    const path = `./uploads/${tabla}/${nombreArchivo}`

    archivo.mv(path, err => {
        if (err) return res.status(500).json({
            success: false,
            mensaje: 'Error al mover el archivo',
            err
        })

        subirPorTabla(tabla, _id, nombreArchivo, res)

    })
})

let subirPorTabla = (tabla, _id, nombreArchivo, res) => {
    if (tabla === 'usuarios') {
        usuarioModel.findById(_id, (err, usuario) => {
            validarYeliminarImagen('./uploads/usuarios/' + usuario.img)
            usuario.img = nombreArchivo
            usuario.save((err, usuarioActualizado) => {
                if (err) return res.status(500).json({
                    success: false,
                    mensaje: 'Ocurrió un error al actualizar la imagen del usuario',
                    err
                })

                return res.status(200).json({
                    success: true,
                    mensaje: 'Usuario actualizado',
                    usuarioActualizado
                })
            })
        })
    }

    if (tabla === 'medicos') {
        medicoModel.findById(_id, (err, medico) => {
            validarYeliminarImagen('./uploads/medicos/' + medico.img)
            medico.img = nombreArchivo
            medico.save((err, medicoctualizado) => {
                if (err) return res.status(500).json({
                    success: false,
                    mensaje: 'Ocurrió un error al actualizar la imagen del medico',
                    err
                })
                return res.status(200).json({
                    success: true,
                    mensaje: 'Medico actualizado',
                    medicoctualizado
                })
            })
        })
    }

    if (tabla === 'hospitales') {
        hospitalModel.findById(_id, (err, hospital) => {
            validarYeliminarImagen('./uploads/hospitales/' + hospital.img)
            hospital.img = nombreArchivo
            hospital.save((err, hospitalctualizado) => {
                if (err) return res.status(500).json({
                    success: false,
                    mensaje: 'Ocurrió un error al actualizar la imagen del hospital',
                    err
                })
                return res.status(200).json({
                    success: true,
                    mensaje: 'Hospital actualizado',
                    hospitalctualizado
                })
            })
        })
    }
}

let validarYeliminarImagen = (path) => {
    if (fs.existsSync(path)) {
        fs.unlink(path)
    }
}

module.exports = app