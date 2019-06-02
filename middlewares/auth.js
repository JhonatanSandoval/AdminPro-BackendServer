const jwt = require('jsonwebtoken')
const configJwt = require('../config/jwt')

/**
 * Verificar token - Middleware
 */
exports.verificaToken = (req, res, next) => {
	const token = req.query.token
	jwt.verify(token, configJwt.jwtSeed, (err, decoded) => {
		if (err) return res.status(401).json({ success: false, mensaje: 'Token de acceso inválido', err })
		req.usuarioToken = decoded.usuario
		next()
	})
}