const express = require('express')
const app = express()

const medicoModel = require('../database/models/medicoModel')
const authMiddleware = require('../middlewares/auth')

/**
 * Obtener medicos
 */
app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0
    desde = Number(desde)

    medicoModel
        .find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al cargar los medicos', err })

            medicoModel.count({}, (err, conteo) => {
                return res
                    .status(200)
                    .json({
                        success: true,
                        total: conteo,
                        medicos
                    })
            })
        })
})

/**
 * Agregar un nuevo medico
 */
app.post('/agregar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body
    const medico = new medicoModel({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuarioToken._id,
        hospital: body.hospital_id
    })
    medico.save((err, response) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear el medico', err })
        return res.status(201).json({
            success: true,
            medico
        })
    })
})

/**
 * Actualizar un medico
 */
app.put('/actualizar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body

    medicoModel.findById(body._id, (err, medico) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar al medico', err })

        if (!medico) {
            return res.status(400).json({ success: false, mensaje: 'No existe el medico que se desea actualizar', err })
        }

        medico.nombre = body.nombre
        medico.img = body.img

        medico.save((err, rs) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar el medico', err })
            return res.status(200).json({
                success: true,
                id: body._id,
                medico
            })
        })
    })
})

/**
 * Eliminar un medico
 */
app.delete('/eliminar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body,
        _id = body._id

    medicoModel.findByIdAndRemove(_id, (err, rs) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar el medico', err })
        return res.status(201).json({
            success: true,
            rs
        })
    })
})

module.exports = app