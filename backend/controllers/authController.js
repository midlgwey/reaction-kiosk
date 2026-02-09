import { StatusCodes } from "http-status-codes";
import { createJWT } from '../utils/tokenUtils.js';
import { createAdmin, findAdminByEmail } from "../repositories/admin.repo.js";
import { encryptPassword, comparePassword  } from '../utils/passwordUtils.js'
import { UnauthenticatedError, BadRequestError   } from "../errors/customErrors.js";

//Registro de admin
export const registerAdmin = async (req, res) => {

  const { name, lastname, email, password } = req.body;

  //Valida Campos
  if (!name || !lastname || !email || !password) {
    throw new BadRequestError("Todos los campos son obligatorios");
  }

  //Verifcar si ya existe
   const existingAdmin = await findAdminByEmail(email);
  if (existingAdmin) {
      throw new BadRequestError("Ya existe un administrador con ese correo");
  }

  //encripta
  const hashedPassword = await encryptPassword(password);

  await createAdmin({
    name,
    lastname,
    email,
    password: hashedPassword,
  });

res
    .status(StatusCodes.CREATED)
    .json({ message: "Administrador registrado exitosamente" });
};

export const loginAdmin = async (req, res) => {

  const { email, password } = req.body;

  //Validar campos
  if (!email || !password) {
      throw new BadRequestError("Email y contraseña son obligatorios");
  }

  //Buscar admin en la base de datos
  const admin = await findAdminByEmail(email)

  console.log("Admin Encontrado:", admin);

  if (!admin) {
    throw new UnauthenticatedError("Credenciales inválidas");
  }

  //Comparar contraseña
  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) {
    throw new UnauthenticatedError("Credenciales inválidas");
  }

    // Crear JWT
    const token = createJWT({

    id: admin.id,
    role: "admin",
    name: admin.name,

  });

  // Enviar token en cookie segura
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
     maxAge: 1000 * 60 * 60, // 1 hora
  });

  res.status(StatusCodes.OK).json({ message: "Login exitoso" });
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("token");
  res.status(StatusCodes.OK).json({ message: "Sesión cerrada" });
};

export const getCurrentAdmin = async (req, res) => {
  // si llegó aquí → authenticateAdmin ya validó token
  res.status(200).json({
    admin: req.user,
    authenticated: true
  });
};