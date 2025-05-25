const Evaluacion = require('../models/Evaluacion');
const Estudiante = require('../models/Estudiante');
exports.crearEvaluacion = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.body.estudiante);
    
    if (!estudiante) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }
    
    req.body.createdBy = req.user.id;
    
    const horarioInicio = new Date(req.body.horarioInicio);
    const horarioFin = new Date(req.body.horarioFin);
    
    if (horarioInicio >= horarioFin) {
      return res.status(400).json({
        success: false,
        message: 'El horario de inicio debe ser anterior al horario de fin'
      });
    }
    
    const evaluacion = await Evaluacion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: evaluacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear evaluación',
      error: error.message
    });
  }
};

exports.getEvaluaciones = async (req, res) => {
  try {
    let evaluaciones;
    
    if (req.user.tipo === 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Los administradores no tienen permiso para ver evaluaciones'
      });
    } else if (req.user.tipo === 'lector') {
     

      const query = {
        $or: [
          { evaluador: req.user.id },
          { createdBy: req.user.id }
        ]
      };
      
      
      
      evaluaciones = await Evaluacion.find(query)
        .populate({
          path: 'estudiante',
          select: 'nombre apellido'
        })
        .populate({
          path: 'evaluador',
          select: 'nombre apellido'
        })
        .lean();
      
      // Asegurarse de que los IDs se conviertan a strings
      evaluaciones = evaluaciones.map(eval => ({
        ...eval,
        _id: eval._id.toString(),
        evaluador: eval.evaluador ? {
          ...eval.evaluador,
          _id: eval.evaluador._id.toString()
        } : null,
        createdBy: eval.createdBy.toString(),
        estudiante: eval.estudiante ? {
          ...eval.estudiante,
          _id: eval.estudiante._id.toString()
        } : null
      }));
      
    
      
    } else {
      evaluaciones = await Evaluacion.find()
        .populate({
          path: 'estudiante',
          select: 'nombre apellido'
        })
        .populate({
          path: 'evaluador',
          select: 'nombre apellido'
        })
        .lean();
    }
    
    // Asegurarse de que las evaluaciones no sean null
    if (!evaluaciones) {
      evaluaciones = [];
    }
    
    res.status(200).json({
      success: true,
      count: evaluaciones.length,
      data: evaluaciones,
      userInfo: {
        id: req.user.id,
        tipo: req.user.tipo
      }
    });
  } catch (error) {
    console.error('Error en getEvaluaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evaluaciones',
      error: error.message
    });
  }
};

exports.getEvaluacion = async (req, res) => {
  try {
    const evaluacion = await Evaluacion.findById(req.params.id)
      .populate('estudiante')
      .populate('evaluador');
    
    if (!evaluacion) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }
    
   
    
    // Verificar permisos
    if (req.user.tipo === 'lector') {
      const evaluadorId = evaluacion.evaluador ? evaluacion.evaluador._id.toString() : evaluacion.evaluador.toString();
      const createdById = evaluacion.createdBy.toString();
      const userId = req.user.id;
      
      
      
      // Permitir acceso si el lector es el evaluador o el creador
      if (evaluadorId !== userId && createdById !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para ver esta evaluación'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: evaluacion
    });
  } catch (error) {
    console.error('Error en getEvaluacion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la evaluación',
      error: error.message
    });
  }
};

exports.updateEvaluacion = async (req, res) => {
  try {
    let evaluacion = await Evaluacion.findById(req.params.id);
    
    if (!evaluacion) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }
    
      if (req.user.tipo === 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Los administradores no tienen permiso para actualizar evaluaciones'
      });
    } else if (req.user.tipo === 'lector' && evaluacion.evaluador.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permiso para actualizar esta evaluación'
      });
    }
    
    if (req.user.tipo === 'lector') {
      const now = new Date();
      
      if (now < evaluacion.horarioInicio || now > evaluacion.horarioFin) {
        return res.status(403).json({
          success: false,
          message: `La evaluación solo puede ser realizada entre ${evaluacion.horarioInicio.toLocaleString()} y ${evaluacion.horarioFin.toLocaleString()}`
        });
      }
    }
    
    evaluacion = await Evaluacion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: evaluacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar evaluación',
      error: error.message
    });
  }
};

exports.deleteEvaluacion = async (req, res) => {
  try {
    const evaluacion = await Evaluacion.findById(req.params.id);
    
    if (!evaluacion) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }
    
    if (req.user.tipo !== 'director') {
      return res.status(403).json({
        success: false,
        message: 'Solo los directores pueden eliminar evaluaciones'
      });
    }
    
    await evaluacion.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar evaluación',
      error: error.message
    });
  }
};
