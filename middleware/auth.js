const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No está autorizado para acceder a esta ruta'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Usuario.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No se encontró un usuario con este ID'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'No está autorizado para acceder a esta ruta'
    });
  }
};

exports.authorize = (...tipos) => {
  return (req, res, next) => {
    if (!tipos.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        message: `El usuario con rol ${req.user.tipo} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};
