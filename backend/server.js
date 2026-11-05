require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado exitosamente a MongoDB Atlas.'))
    .catch(err => console.error('Error de conexión a Atlas:', err));

const contribuyenteSchema = new mongoose.Schema({
    cuit: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    clave: { 
        type: String, 
        required: true 
    }
});

const Contribuyente = mongoose.model('Contribuyente', contribuyenteSchema);

app.post('/api/register', async (req, res) => {
    const { cuit, clave } = req.body;
    
    try {
        const nuevoContribuyente = new Contribuyente({ cuit, clave });
        await nuevoContribuyente.save();
        res.status(201).json({ message: 'Clave generada exitosamente.' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Este CUIT ya tiene una clave.' });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { cuit, clave } = req.body;
    
    try {
        const usuario = await Contribuyente.findOne({ cuit, clave });
        
        if (usuario) {
            res.status(200).json({ message: 'Autenticación exitosa.' });
        } else {
            res.status(401).json({ message: 'CUIT/CUIL o Clave Fiscal incorrectos.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});