// backend/middlewares/authMiddleware.js
import { UnauthenticatedError, UnauthorizedError } from '../errors/customErrors.js';
import { verifyJWT } from '../utils/tokenUtils.js';

// Verifica si inició sesión y el token es válido 
export const authenticateAdmin = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    try {
        const { id, role, name } = verifyJWT(token);
        req.user = { id, role, name };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Invalid or expired token');
    }
};

// Verifica si el rol tiene acceso a la ruta
export const authorizePermissions = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.role)) {
            throw new UnauthorizedError('Acceso denegado: No tienes permisos para esta acción');
        }
        next();
    };
};