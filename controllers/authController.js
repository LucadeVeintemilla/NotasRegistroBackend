const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const validarCedula = require('../utils/validarCedula');


exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, cedula, correo, telefono, contraseña, tipo, tipoDocumento } = req.body;

    // Validar cédula solo si el tipo de documento es cédula (por defecto)
    if (!tipoDocumento || tipoDocumento === 'cedula') {
      if (!validarCedula(cedula)) {
        return res.status(400).json({ success: false, message: 'La cédula ingresada no es válida' });
      }
    }

    // Validar unicidad de roles únicos (director y técnico)
    if (tipo === 'director') {
      const directorExistente = await Usuario.findOne({ tipo: 'director' });
      if (directorExistente) {
        return res.status(400).json({ success: false, message: 'Ya existe un usuario con rol Director en el sistema' });
      }
    }
    if (tipo === 'tecnico') {
      const tecnicoExistente = await Usuario.findOne({ tipo: 'tecnico' });
      if (tecnicoExistente) {
        return res.status(400).json({ success: false, message: 'Ya existe un usuario con rol Técnico en el sistema' });
      }
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
      // Si el tipo incluye [in], es una búsqueda de múltiples tipos
      if (typeof tipo === 'object' && tipo.in) {
        const tipos = tipo.in.split(',');
        query.tipo = { $in: tipos };
      } else {
        query.tipo = tipo;
      }
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


// @desc    Actualizar usuario por ID
// @route   PUT /api/auth/usuarios/:id
// @access  Privado (solo administrador)
exports.actualizarUsuario = async (req, res) => {
  try {
    const camposPermitidos = ['nombre', 'apellido', 'correo', 'telefono', 'tipo', 'contraseña'];
    const datosActualizacion = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) datosActualizacion[campo] = req.body[campo];
    });

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: datosActualizacion },
      { new: true, runValidators: true, context: 'query' }
    ).select('-contraseña');

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Usuario actualizado', usuario });
  } catch (error) {
    console.error(error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.correo) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese nombre' });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
  }
};

// @desc    Eliminar usuario por ID
// @route   DELETE /api/auth/usuarios/:id
// @access  Privado (solo administrador)
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
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
    const { nombre, apellido, cedula, correo, telefono, contraseña, tipo, tipoDocumento } = req.body;

    // Validar cédula solo si el tipo de documento es cédula (por defecto)
    if (!tipoDocumento || tipoDocumento === 'cedula') {
      if (!validarCedula(cedula)) {
        return res.status(400).json({ success: false, message: 'La cédula ingresada no es válida' });
      }
    }

    if (tipo !== 'lector' && tipo !== 'director' && tipo !== 'secretario' && tipo !== 'tecnico') {
      return res.status(403).json({
        success: false,
        message: 'Los técnicos solo pueden registrar usuarios con rol de lector o director'
      });
    }

    // Validar unicidad de roles únicos (director y técnico)
    if (tipo === 'director') {
      const directorExistente = await Usuario.findOne({ tipo: 'director' });
      if (directorExistente) {
        return res.status(400).json({ success: false, message: 'Ya existe un usuario con rol Director en el sistema' });
      }
    }
    if (tipo === 'tecnico') {
      const tecnicoExistente = await Usuario.findOne({ tipo: 'tecnico' });
      if (tecnicoExistente) {
        return res.status(400).json({ success: false, message: 'Ya existe un usuario con rol Técnico en el sistema' });
      }
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
