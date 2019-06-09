const express = require('express')
const app = express()

const hospitalModel = require('../database/models/hospitalModel')
const medicoModel = require('../database/models/medicoModel')
const usuarioModel = require('../database/models/usuarioModel')


/**
 * Búsqueda por colleción
 */
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    const tabla = req.params.tabla
    const busqueda = req.params.busqueda
    let regex = new RegExp(busqueda, 'i')

    let promesa
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex)
            break

        case 'medicos':
            promesa = buscarMedicos(regex)
            break

        case 'hospitales':
            promesa = buscarHospitales(regex)
            break

        default:
            return res.status(400).json({
                success: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                err: { message: 'Tipo de tabla/colleción no válido' }
            })
            break
    }

    promesa.then(data => {
        res
            .status(200)
            .json({
                success: true,
                [tabla]: data
            })
    })

})

/**
 * Búsqueda general
 */
app.get('/todo/:busqueda', (req, res, next) => {
    const busqueda = req.params.busqueda
    let regex = new RegExp(busqueda, 'i')
    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(responses => {
        res
            .status(200)
            .json({
                success: true,
                hospitales: responses[0],
                medicos: responses[1],
                usuarios: responses[2]
            })
    })
})

let buscarHospitales = (regex) => {
    return new Promise((resolve, reject) => {
        hospitalModel
            .find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) reject('Error al cargar hospitales', err)
                resolve(hospitales)
            })
    })
}

let buscarMedicos = (regex) => {
    return new Promise((resolve, reject) => {
        medicoModel
            .find({ nombre: regex })
            .populate('hospital', 'nombre img')
            .populate('usuario', 'nombre email img')
            .exec((err, medicos) => {
                if (err) reject('Error al cargar medicos', err)
                resolve(medicos)
            })
    })
}

let buscarUsuarios = (regex) => {
    return new Promise((resolve, reject) => {
        usuarioModel
            .find({}, 'nombre email role img')
            .or([
                { nombre: regex },
                { email: regex }
            ])
            .exec((err, usuarios) => {
                if (err) reject('Error al cargar usuarios', err)
                resolve(usuarios)
            })
    })
}

module.exports = app