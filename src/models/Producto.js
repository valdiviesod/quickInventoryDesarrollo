const mongoose = require('mongoose');
const {Schema} = mongoose;


const ProductoSchema = new Schema({
    nombre : { type: String, required: true },
    descripcion : {type: String, required: true},
    precio : {type: Number, required: true},
    cantidad : {type: Number, required: true},
    archivo : {type: String}
})

module.exports = mongoose.model('Producto', ProductoSchema);