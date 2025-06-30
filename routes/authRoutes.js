const express = require('express');
const { 
  registro, 
  login, 
  getMe, 
  logout, 
  getUsuariosPorTipo, 
  registroPorTecnico, 
  cambiarPassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Rutas protegidas
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.get('/usuarios', protect, authorize('administrador', 'director', 'secretario'), getUsuariosPorTipo);

// Ruta para técnicos y secretarios
router.post('/registro-tecnico', protect, authorize('tecnico', 'secretario'), registroPorTecnico);

// Ruta para cambiar contraseña
router.put('/cambiar-password', protect, cambiarPassword);

module.exports = router;
