const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese su nombre'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'Por favor ingrese su apellido'],
    trim: true
  },
  cedula: {
    type: String,
    required: [true, 'Por favor ingrese su cédula'],
    unique: true,
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'Por favor ingrese su correo electrónico'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un correo electrónico válido'
    ]
  },
  telefono: {
    type: String,
    required: [true, 'Por favor ingrese su número de teléfono'],
    trim: true
  },
  contraseña: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
    select: false
  },
  tipo: {
    type: String,
    enum: ['administrador', 'lector', 'director'],
    required: [true, 'Por favor seleccione un tipo de usuario']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña usando bcrypt
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contraseña')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
});

// Firmar JWT y devolver
UsuarioSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, tipo: this.tipo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

UsuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.contraseña);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
