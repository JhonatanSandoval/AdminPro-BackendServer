const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs')

app.get('/:tipo/:img', (req, res, next) => {

    const tipo = req.params.tipo, img = req.params.img
    const pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`)
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg)
    } else {
        const pathNoImg = path.resolve(__dirname, `../assets/no-img.jpg`)
        res.sendFile(pathNoImg)
    }

})

module.exports = app