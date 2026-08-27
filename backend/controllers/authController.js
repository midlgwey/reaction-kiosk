import { StatusCodes } from "http-status-codes";
import { createJWT } from '../utils/tokenUtils.js';
import { createAdmin, findAdminByEmail } from "../repositories/admin.repo.js";
import { encryptPassword, comparePassword } from '../utils/passwordUtils.js';
import { UnauthenticatedError, BadRequestError } from "../errors/customErrors.js";
import { ROLE_PERMISSIONS } from '../config/permissions.js';

// Registro de admin/supervisor
export const registerAdmin = async (req, res) => {
  const { name, lastname, email, password, role = 'supervisor' } = req.body;

  const existingAdmin = await findAdminByEmail(email);
  if (existingAdmin) {
    throw new BadRequestError("Ya existe un administrador con ese correo");
  }

  const hashedPassword = await encryptPassword(password);

  await createAdmin({
    name,
    lastname,
    email,
    password: hashedPassword,
    role
  });

  res.status(StatusCodes.CREATED).json({ 
    message: "Administrador registrado exitosamente" 
  });
};

// Login de usuario
export const loginAdmin = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw new UnauthenticatedError("Credenciales inválidas");
  }

  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) {
    throw new UnauthenticatedError("Credenciales inválidas");
  }

  // Crear JWT con datos necesarios
  const token = createJWT({
    id: admin.id,
    role: admin.role,
    name: admin.name,
  });

  // Configurar cookie con el token, considerando "remember me"
  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = oneDay * 30;
  const maxAge = rememberMe ? thirtyDays : oneDay;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge,
    path: '/'
  });

  // Obtener permisos según el rol del admin
  const userPermissions = ROLE_PERMISSIONS[admin.role] || {};

  res.status(StatusCodes.OK).json({
    message: "Login exitoso",
    role: admin.role,
    permissions: userPermissions,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
};

// Logout
export const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: '/'
  });

  res.status(StatusCodes.OK).json({ message: "Sesión cerrada" });
};

// Obtener datos del usuario autenticado actual (/me)
export const getCurrentAdmin = async (req, res) => {
  // authenticateAdmin ya validó token e inyectó req.user
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || {};

  res.status(StatusCodes.OK).json({
    admin: req.user,
    permissions: userPermissions,
    authenticated: true
  });
};