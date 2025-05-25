const express = require('express');
const { 
  crearEvaluacion, 
  getEvaluaciones, 
  getEvaluacion, 
  updateEvaluacion, 
  deleteEvaluacion 
} = require('../controllers/evaluacionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas utilizan el middleware protect
router.use(protect);

// Rutas accesibles según el tipo de usuario
router.route('/')
  .get(authorize('lector', 'director'), getEvaluaciones) // Solo lector y director
  .post(authorize('lector', 'administrador', 'director'), crearEvaluacion); // Permitir a lector, administrador y director

router.route('/:id')
  .get(authorize('lector', 'director'), getEvaluacion) // Solo lector y director
  .put(authorize('lector', 'director'), updateEvaluacion) // Solo lector y director pueden actualizar/calificar
  .delete(authorize('director'), deleteEvaluacion); // Solo director puede eliminar

module.exports = router;
