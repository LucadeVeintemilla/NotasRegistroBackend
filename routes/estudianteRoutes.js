const express = require('express');
const { 
  crearEstudiante, 
  getEstudiantes, 
  getEstudiante, 
  updateEstudiante, 
  deleteEstudiante, 
  verificarEstudiante 
} = require('../controllers/estudianteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/verificar/:cedula', verificarEstudiante);

router.route('/')
  .get(getEstudiantes)
  .post(authorize('administrador', 'director', 'secretario'), crearEstudiante);

router.route('/:id')
  .get(getEstudiante)
  .put(authorize('administrador', 'director', 'secretario'), updateEstudiante)
  .delete(authorize('administrador', 'director', 'secretario'), deleteEstudiante);

module.exports = router;
