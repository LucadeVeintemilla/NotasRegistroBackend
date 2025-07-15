const express = require('express');
const { 
  registro, 
  login, 
  getMe, 
  logout, 
  getUsuariosPorTipo,
  actualizarUsuario,
  eliminarUsuario,
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
router.get('/usuarios', protect, authorize('administrador', 'director', 'secretario', 'tecnico'), getUsuariosPorTipo);

// Rutas de gestión de usuarios por administrador
router.put('/usuarios/:id', protect, authorize('administrador'), actualizarUsuario);
router.delete('/usuarios/:id', protect, authorize('administrador'), eliminarUsuario);

// Ruta para técnicos y secretarios
router.post('/registro-tecnico', protect, authorize('administrador', 'tecnico', 'secretario'), registroPorTecnico);

// Ruta para cambiar contraseña
router.put('/cambiar-password', protect, cambiarPassword);

module.exports = router;
