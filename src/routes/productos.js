
const router = require('express').Router();
const { restart } = require('nodemon');
const Producto = require('../models/Producto');
const fs = require('fs-extra'); //Mdoulo para mover la imgen 
const { isAuthenticated } = require('../helpers/auth'); //Sirve para proteger las rutas
const path = require('path');

router.get('/productos', isAuthenticated, async (req,res) =>{
    const productos = await Producto.find().lean().sort({date: -1});
    res.render('productos/all-product',{productos});
})

router.get('/productos/agregar',(req,res) =>{
    res.render('productos/new-product');
})
//Ruta para agregar los productos
router.post('/productos/new', isAuthenticated, async (req,res) =>{
    const { nombre,descripcion,modelo,precio,cantidad,nombre_prov,direccion_prov,email_prov,telefono_prov,nombre_cat,descripcion_cat } = req.body;
    //Nombre de la imagen
    const imagen = Date.now() + "_" + req.file.originalname;
    const guardarImagen = async() => {
        const filePatch = req.file.path;
        const targetPath = path.resolve(`src/public/upload/${imagen}`);
        await fs.rename(filePatch, targetPath); 
    }
    //Guarda la imagen
    guardarImagen();
    
    const newProduct = new Producto({
        nombre,
        descripcion,
        modelo,
        precio,
        cantidad,
        imagen : imagen,
        "proveedor":{
            "nombre": nombre_prov,
            "direccion": direccion_prov,
            "email": email_prov,
            "telefono": telefono_prov
        },
        "categoria": {
            "nombre": nombre_cat,
            "descripcion": descripcion_cat,
            
        }
    });
    await newProduct.save();
    res.redirect('/productos');
    
})
router.get('/productos/edit/:id', isAuthenticated, async (req,res) =>{
    const producto = await Producto.findById(req.params.id).lean();
    res.render('productos/edit-product',{ producto });
})
router.put('/productos/update/:id', isAuthenticated, async (req,res) =>{
    const { nombre,descripcion,modelo,precio,cantidad,nombre_prov,direccion_prov,email_prov,telefono_prov,nombre_cat,descripcion_cat,imagen_cat } = req.body
    //Nombre de la imagen
    const imagen = Date.now() + "_" + req.file.originalname;
    const filePatch = req.file.path;
    const guardarImagen = async() => {
        const targetPath = path.resolve(`src/public/upload/${imagen}`);
        await fs.rename(filePatch, targetPath); 
    }
    //Guarda la imagen
    guardarImagen();
    //Ruta
    const patchImg = path.resolve(`src/public/upload/`);
    
    const producto = await Producto.findById(req.params.id);
    await fs.unlink(patchImg + '/' + producto.imagen);
    
    await Producto.findByIdAndUpdate({_id: req.params.id},{
        nombre,
        descripcion,
        modelo,
        precio,
        cantidad,
        imagen: imagen,
        "proveedor":{
            "nombre": nombre_prov,
            "direccion": direccion_prov,
            "email": email_prov,
            "telefono": telefono_prov
        },
        "categoria": {
            "nombre": nombre_cat,
            "descripcion": descripcion_cat
        }
    });
    req.flash('success_msg', 'Producto actualizado');
    res.redirect('/productos');
    
})

router.delete('/productos/delete/:id', isAuthenticated, async (req, res)=>{
    //DELETE IMAGES PRODUCTS
    const producto = await Producto.findById(req.params.id);
    const patchImg = path.resolve(`src/public/upload/`);
    await fs.unlink(patchImg + '/' + producto.imagen);
    await Producto.findByIdAndDelete({_id: req.params.id});
    req.flash('success_msg', 'Producto eliminado!!');
    res.redirect('/productos'); //Redirect route => /productos
});
module.exports = router
