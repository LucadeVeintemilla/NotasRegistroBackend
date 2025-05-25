const mongoose = require('mongoose');

const ResultadoSchema = new mongoose.Schema({
  criterio: {
    type: String,
    required: true
  },
  indicador: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  valorSeleccionado: {
    type: Number,
    required: true
  }
});

const EvaluacionSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  evaluador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  resultados: [ResultadoSchema],
  notaFinal: {
    type: Number,
    required: true
  },
  comentarios: {
    type: String,
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  horarioInicio: {
    type: Date,
    required: [true, 'Por favor especifique la hora de inicio de la evaluación']
  },
  horarioFin: {
    type: Date,
    required: [true, 'Por favor especifique la hora de fin de la evaluación']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
});

EvaluacionSchema.methods.dentroDeHorarioPermitido = function() {
  const now = new Date();
  return now >= this.horarioInicio && now <= this.horarioFin;
};

module.exports = mongoose.model('Evaluacion', EvaluacionSchema);
