const express = require('express');
const { 
  crearEstudiante, 
  getEstudiantes, 
  getEstudiante, 
  updateEstudiante, 
  deleteEstudiante 
} = require('../controllers/estudianteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEstudiantes)
  .post(authorize('administrador', 'director'), crearEstudiante);

router.route('/:id')
  .get(getEstudiante)
  .put(authorize('administrador', 'director'), updateEstudiante)
  .delete(authorize('administrador', 'director'), deleteEstudiante);

module.exports = router;
