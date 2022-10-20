
const router = require('express').Router();
const { restart } = require('nodemon');
const Producto = require('../models/Producto');
const fs = require('fs-extra'); 
const { isAuthenticated } = require('../helpers/auth'); 
const path = require('path');

router.get('/productos', isAuthenticated, async (req,res) =>{
    const productos = await Producto.find().lean().sort({date: -1});
    res.render('productos/all-product',{productos});
})

router.get('/productos/agregar',(req,res) =>{
    res.render('productos/new-product');
})

router.post('/productos/new', isAuthenticated, async (req,res) =>{
    const { nombre,descripcion,precio,cantidad } = req.body;
    const archivo = Date.now() + "_" + req.file.originalname;
    const guardarArchivo = async() => {
        const filePatch = req.file.path;
        const targetPath = path.resolve(`src/public/upload/${archivo}`);
        await fs.rename(filePatch, targetPath); 
    }
    guardarArchivo();
    
    const newProduct = new Producto({
        nombre,
        descripcion,
        precio,
        cantidad,
        archivo : archivo
    });
    await newProduct.save();
    res.redirect('/productos');
    
})
router.get('/productos/edit/:id', isAuthenticated, async (req,res) =>{
    const producto = await Producto.findById(req.params.id).lean();
    res.render('productos/edit-product',{ producto });
})
router.put('/productos/update/:id', isAuthenticated, async (req,res) =>{
    const { nombre,descripcion,precio,cantidad } = req.body
    
    const archivo = Date.now() + "_" + req.file.originalname;
    const filePatch = req.file.path;
    const guardarArchivo = async() => {
        const targetPath = path.resolve(`src/public/upload/${archivo}`);
        await fs.rename(filePatch, targetPath); 
    }

    guardarArchivo();
    
    const patchImg = path.resolve(`src/public/upload/`);
    
    const producto = await Producto.findById(req.params.id);
    await fs.unlink(patchImg + '/' + producto.archivo);
    
    await Producto.findByIdAndUpdate({_id: req.params.id},{
        nombre,
        descripcion,
        precio,
        cantidad,
        archivo: archivo
    });
    req.flash('success_msg', 'Producto actualizado');
    res.redirect('/productos');
    
})

router.delete('/productos/delete/:id', isAuthenticated, async (req, res)=>{
    //DELETE IMAGES PRODUCTS
    const producto = await Producto.findById(req.params.id);
    const patchImg = path.resolve(`src/public/upload/`);
    await fs.unlink(patchImg + '/' + producto.archivo);
    await Producto.findByIdAndDelete({_id: req.params.id});
    req.flash('success_msg', 'Producto eliminado!!');
    res.redirect('/productos'); //Redirect route => /productos
});
module.exports = router
