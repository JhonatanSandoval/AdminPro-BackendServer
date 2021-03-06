const express = require('express')
const bcrypt = require('bcryptjs')

const app = express()
const usuarioModel = require('../database/models/usuarioModel')

const authMiddleware = require('../middlewares/auth')

/**
 * Obtener todos los usuarios
 */
app.get('/', (req, res, next) => {
	let desde = req.query.desde || 0
	desde = Number(desde)

	usuarioModel.find({})
		.skip(desde)
		.limit(5)
		.exec((err, usuarios) => {
			if (err) return res.status(500).json({ success: false, mensaje: 'Error al cargar usuarios', err })

			usuarioModel.count({}, (err, conteo) => {
				return res
					.status(200)
					.json({
						success: true,
						total: conteo,
						usuarios
					})
			})

		})
})

/**
 * Agregar un nuevo usuario
 */
app.post('/agregar', (req, res, next) => {

	const body = req.body
	const usuario = new usuarioModel({
		nombre: body.nombre, email: body.email,
		password: bcrypt.hashSync(body.password, 10), img: body.img,
		role: body.role
	})
	usuario.save((err, response) => {
		if (err) return res.status(500).json({ success: false, mensaje: 'Error al crear el usuario', err })
		return res.status(201).json({
			success: true,
			usuario
		})
	})
})


/**
 * Actualizar un usuario existente
 */
app.put('/actualizar', [authMiddleware.verificaToken, authMiddleware.verificaAdminRole], (req, res, next) => {
	const body = req.body

	usuarioModel.findById(body._id, (err, usuario) => {
		if (err) return res.status(500).json({ success: false, mensaje: 'Error al buscar al usuario', err })

		if (!usuario) {
			return res.status(400).json({ success: false, mensaje: 'No existe el usuario que se desea actualizar', err })
		}

		usuario.nombre = body.nombre
		usuario.email = body.email
		usuario.role = body.role

		usuario.save((err, rs) => {
			if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar al usuario', err })

			return res.status(200).json({
				success: true,
				id: body._id,
				usuario
			})
		})
	})
})


/**
 * Eliminar un usuario
 */
app.delete('/eliminar/:id', [authMiddleware.verificaToken, authMiddleware.verificaAdminRole], (req, res, next) => {
	const body = req.body, _id = req.params.id

	usuarioModel.findByIdAndRemove(_id, (err, rs) => {
		if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar al usuario', err })
		return res.status(201).json({
			success: true,
			usuario: rs
		})
	})
})


module.exports = app