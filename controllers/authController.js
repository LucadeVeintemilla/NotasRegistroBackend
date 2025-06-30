const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');


exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, cedula, correo, telefono, contraseña, tipo } = req.body;

    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ correo }, { cedula }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo o cédula'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      apellido,
      cedula,
      correo,
      telefono,
      contraseña,
      tipo
    });

    const token = usuario.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione correo y contraseña'
      });
    }

    const usuario = await Usuario.findOne({ correo }).select('+contraseña');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isMatch = await usuario.matchPassword(contraseña);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = usuario.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Privado
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

// @desc    Obtener usuarios por tipo
// @route   GET /api/auth/usuarios
// @access  Privado (solo administradores y directores)
exports.getUsuariosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let query = {};
    
    // Si se especifica un tipo, filtrar por ese tipo
    if (tipo) {
      query.tipo = tipo;
    }
    
    const usuarios = await Usuario.find(query).select('-contraseña');
    
    res.status(200).json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};


// @desc    Cambiar contraseña del usuario autenticado
// @route   PUT /api/auth/cambiar-password
// @access  Privado
exports.cambiarPassword = async (req, res) => {
  try {
    const { contraseñaActual, nuevaContraseña } = req.body;
    
    // Validar campos
    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese la contraseña actual y la nueva contraseña'
      });
    }

    // Obtener el usuario
    const usuario = await Usuario.findById(req.user.id).select('+contraseña');
    
    // Verificar la contraseña actual
    const isMatch = await usuario.matchPassword(contraseñaActual);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar la contraseña
    usuario.contraseña = nuevaContraseña;
    await usuario.save();

    // Generar nuevo token
    const token = usuario.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};

exports.registroPorTecnico = async (req, res) => {
  try {
    const { nombre, apellido, cedula, correo, telefono, contraseña, tipo } = req.body;

    if (tipo !== 'lector' && tipo !== 'director') {
      return res.status(403).json({
        success: false,
        message: 'Los técnicos solo pueden registrar usuarios con rol de lector o director'
      });
    }

    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ correo }, { cedula }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo o cédula'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      apellido,
      cedula,
      correo,
      telefono,
      contraseña,
      tipo
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};
