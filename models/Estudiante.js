const mongoose = require('mongoose');

const EstudianteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese el nombre del estudiante'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'Por favor ingrese el apellido del estudiante'],
    trim: true
  },
  cedula: {
    type: String,
    required: [true, 'Por favor ingrese la cédula del estudiante'],
    unique: true,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['antigua', 'actual'],
    required: [true, 'Por favor seleccione el tipo de disertación']
  },
  maestria: {
    type: String,
    required: [true, 'Por favor ingrese la maestría del estudiante'],
    trim: true
  },
  tutor: {
    type: String,
    required: [true, 'Por favor ingrese el tutor asignado'],
    trim: true
  },
  tesis: {
    type: String,
    required: [true, 'Por favor ingrese el título de la tesis'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
});

const Estudiante = mongoose.model('Estudiante', EstudianteSchema);

Estudiante.collection.dropIndex('codigo_1').catch((err) => {
  if (err.code !== 27) { 
    console.warn('No se pudo eliminar index codigo_1:', err.message);
  }
});

module.exports = Estudiante;
