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

/**
 * Verificar ADMIN - Middleware
 */
exports.verificaAdminRole = (req, res, next) => {
	const usuario = req.usuarioToken
	if (usuario.role === 'ADMIN_ROLE') {
		next()
	} else {
		return res
			.status(401)
			.json({
				success: false,
				mensaje: 'No tiene permisos para realizar esta operación',
				errors: { message: 'No tiene permisos para realizar esta operación' }
			})
	}
}