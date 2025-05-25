const Estudiante = require('../models/Estudiante');
const Evaluacion = require('../models/Evaluacion');

exports.crearEstudiante = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    const estudiante = await Estudiante.create(req.body);

    res.status(201).json({
      success: true,
      data: estudiante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear estudiante',
      error: error.message
    });
  }
};

exports.getEstudiantes = async (req, res) => {
  try {
    let estudiantes;
    
    if (req.user.tipo === 'lector') {
      const evaluaciones = await Evaluacion.find({ evaluador: req.user.id });
      
      const estudianteIds = [...new Set(evaluaciones.map(eval => eval.estudiante))];
      
      estudiantes = await Estudiante.find({ _id: { $in: estudianteIds } });
    } else {
      estudiantes = await Estudiante.find();
    }

    res.status(200).json({
      success: true,
      count: estudiantes.length,
      data: estudiantes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

exports.getEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id);

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Si es lector, verificar que tenga permiso para ver este estudiante
    if (req.user.tipo === 'lector') {
      const tieneEvaluacion = await Evaluacion.findOne({
        evaluador: req.user.id,
        estudiante: estudiante._id
      });

      if (!tieneEvaluacion) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para ver este estudiante'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: estudiante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiante',
      error: error.message
    });
  }
};

exports.updateEstudiante = async (req, res) => {
  try {
    let estudiante = await Estudiante.findById(req.params.id);

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: estudiante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estudiante',
      error: error.message
    });
  }
};

  exports.deleteEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id);

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    const evaluacionesAsociadas = await Evaluacion.find({ estudiante: req.params.id });
    
    if (evaluacionesAsociadas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el estudiante porque tiene evaluaciones asociadas'
      });
    }

    await estudiante.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar estudiante',
      error: error.message
    });
  }
};
