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
  codigo: {
    type: String,
    required: [true, 'Por favor ingrese el código del estudiante'],
    unique: true,
    trim: true
  },
  curso: {
    type: String,
    required: [true, 'Por favor ingrese el curso del estudiante'],
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

module.exports = mongoose.model('Estudiante', EstudianteSchema);
