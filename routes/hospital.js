const express = require('express')
const app = express()

const hospitalModel = require('../database/models/hospitalModel')
const authMiddleware = require('../middlewares/auth')

/**
 * Obtener hospitales
 */
app.get('/', (req, res, next) => {
    let desde = req.query.desde || 0
    desde = Number(desde)

    hospitalModel
        .find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al cargar los hospitales', err })

            hospitalModel.count({}, (err, conteo) => {
                return res
                    .status(200)
                    .json({
                        success: true,
                        total: conteo,
                        hospitales
                    })
            })

        })
})

/**
 * Agregar un nuevo hospital
 */
app.post('/agregar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body
    const hospital = new hospitalModel({
        nombre: body.nombre, img: body.img,
        usuario: req.usuarioToken._id
    })
    hospital.save((err, response) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear el hospital', err })
        return res.status(201).json({
            success: true,
            hospital
        })
    })
})

/**
 * Actualizar un hospital
 */
app.put('/actualizar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body

    hospitalModel.findById(body._id, (err, hospital) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar al hospital', err })

        if (!hospital) {
            return res.status(400).json({ success: false, mensaje: 'No existe el hospital que se desea actualizar', err })
        }

        hospital.nombre = body.nombre
        hospital.img = body.img

        hospital.save((err, rs) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar el hospital', err })
            return res.status(200).json({
                success: true,
                id: body._id,
                hospital
            })
        })
    })
})

/**
 * Eliminar un hospital
 */
app.delete('/eliminar', authMiddleware.verificaToken, (req, res, next) => {
    const body = req.body,
        _id = body._id

    hospitalModel.findByIdAndRemove(_id, (err, rs) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar el hospital', err })
        return res.status(201).json({
            success: true,
            rs
        })
    })
})

module.exports = app