import { UnauthenticatedError } from '../errors/customErrors.js';
import { verifyJWT } from '../utils/tokenUtils.js';

//Autentica al administrador usando JWT desde cookies
export const authenticateAdmin = (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    try {
        const { id, role, name } = verifyJWT(token);

        // Datos disponibles para los siguientes middlewares / controllers
        req.user = { id, role, name };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Invalid or expired token');
    }
};

