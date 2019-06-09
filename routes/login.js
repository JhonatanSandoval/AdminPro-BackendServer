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

const auth = require('../middlewares/auth')

/**
 * Renovación de token - jwt
 */
app.get('/renueva-token', [auth.verificaToken], (req, res) => {

	let token = jwt.sign({ usuario: req.usuarioToken }, configJwt.jwtSeed, {
		expiresIn: '365d' // 365 dias
	})

	return res.status(200)
		.json({ success: true, usuario: req.usuarioToken, token })
})


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
				expiresIn: '30d'
			})

		usuario.password = null

		res.status(200).json({
			success: true,
			mensaje: 'Login POST correcto',
			token,
			usuario,
			menu: obtenerMenu(usuario.role)
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
					expiresIn: '365d' // 4 hours
				})

				usuarioRegistrado.password = null
				return res.status(200).json({ success: true, token, usuarioRegistrado, menu: obtenerMenu(usuarioRegistrado.role) })
			})

		} else {
			// actualizar
			if (!usuario.google) {
				return res.status(400).json({ success: false, mensaje: 'Debe usar su autenticación normal' })
			} else {
				// crear un token
				let token = jwt.sign({ usuario: usuario }, configJwt.jwtSeed, {
					expiresIn: '365d' // 4 hours
				})

				usuario.password = null
				return res.status(200).json({ success: true, token, usuario, menu: obtenerMenu(usuario.role) })
			}
		}
	})
})

let obtenerMenu = (role) => {
	let menu = [
		{
			titulo: 'Principal',
			icono: 'mdi mdi-gauge',
			submenu: [
				{ titulo: 'Dashboard', url: '/dashboard' },
				{ titulo: 'ProgressBar', url: '/progress' },
				{ titulo: 'Graficas', url: '/graficas1' },
				{ titulo: 'Promesas', url: '/promesas' },
				{ titulo: 'RxJs', url: '/rxjs' }
			]
		},
		{
			titulo: 'Mantenimientos',
			icono: 'mdi mdi-folder-lock-open',
			submenu: [
				//{ titulo: 'Usuarios', url: '/usuarios' },
				{ titulo: 'Hospitales', url: '/hospitales' },
				{ titulo: 'Médicos', url: '/medicos' }
			]
		}
	];

	if (role === 'ADMIN_ROLE') {
		menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' })
	}

	return menu
}


module.exports = app