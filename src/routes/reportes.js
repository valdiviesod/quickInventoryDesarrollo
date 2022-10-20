
const router = require('express').Router();
const { restart } = require('nodemon');
const Producto = require('../models/Producto');
const fs = require('fs-extra'); //Mdoulo para mover la imgen 
const { isAuthenticated } = require('../helpers/auth'); //Sirve para proteger las rutas
const path = require('path');

router.get('/reporte/productos', isAuthenticated, async (req,res) =>{
    const productos = await Producto.find().lean().sort({date: -1});
    res.render('reportes/index',{productos});
})

module.exports = router
