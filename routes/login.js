const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const usuarioModel = require('../database/models/usuarioModel')

const configJwt = require('../config/jwt')
const configGoogleSignIn = require('../config/google-sign')

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = configGoogleSignIn.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

/**
 * Autenticación interna
 */
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


/**
 * Autenticación de Google
 */

async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	//const userid = payload['sub'];
	// If request specified a G Suite domain:
	//const domain = payload['hd'];
	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
		payload
	}
}

app.post('/google', async (req, res, next) => {

	const token = req.body.token
	let userData = await verify(token)
		.catch(e => {
			res.status(403).json({
				success: false,
				mensaje: 'Token de Google no válido'
			})
		})

	usuarioModel.findOne({ email: userData.email }, (err, usuario) => {
		if (err) return res.status(500).json({ success: false, mensaje: 'Ocurrio un error al realizar la consulta', err })

		if (!usuario) {
			// registrar
			let usuario = new usuarioModel()
			usuario.nombre = userData.nombre
			usuario.email = userData.email
			usuario.img = userData.img
			usuario.google = true
			usuario.password = ':))'
			usuario.save((err, usuarioRegistrado) => {
				if (err) return res.status(500).json({ success: false, mensaje: 'Ocurrio un error al realizar la consulta', err })

				// crear un token
				let token = jwt.sign({ usuario: usuarioRegistrado }, configJwt.jwtSeed, {
					expiresIn: 14400 // 4 hours
				})

				usuarioRegistrado.password = null
				return res.status(200).json({ success: true, token, usuarioRegistrado })
			})

		} else {
			// actualizar
			if (!usuario.google) {
				return res.status(400).json({ success: false, mensaje: 'Debe usar su autenticación normal' })
			} else {
				// crear un token
				let token = jwt.sign({ usuario: usuario }, configJwt.jwtSeed, {
					expiresIn: 14400 // 4 hours
				})

				usuario.password = null
				return res.status(200).json({ success: true, token, usuario })
			}

		}
	})

})


module.exports = app