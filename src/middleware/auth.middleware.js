import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'organizaya_dev_secret_key_12345';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso no autorizado',
      message: 'Token de autorización ausente o inválido'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Sesión expirada o token inválido',
      message: err.message
    });
  }
};
