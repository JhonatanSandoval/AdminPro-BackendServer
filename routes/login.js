const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const usuarioModel = require('../database/models/usuarioModel')

const configJwt = require('../config/jwt')

app.post('/', (req, res) => {
	const body = req.body,
		email = body.email, password = body.password

	usuarioModel.findOne({ email: email }, (err, usuario) => {
		if (err) return res.status(500).json({ success: false, mensaje: 'Ocurrio un error al realizar la consulta', err })
		if (!usuario) {
			return res.status(400).json({
				success: true,
				mensaje: 'No se ha encontrado el email'
			})
		}
		if (!bcrypt.compareSync(password, usuario.password)) {
			return res.status(400).json({
				success: true,
				mensaje: 'Su password de acceso es inválida'
			})
		}

		// crear un token
		let token = jwt.sign(
			{ usuario: usuario }, configJwt.jwtSeed, {
				expiresIn: 14400 // 4 hours
			})

		usuario.password = null

		res.status(200).json({
			success: true,
			mensaje: 'Login POST correcto',
			token,
			usuario
		})
	})

})


module.exports = app