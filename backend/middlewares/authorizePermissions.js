import { UnauthorizedError } from '../errors/customErrors.js';

//Autoriza acceso según roles
export const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};
