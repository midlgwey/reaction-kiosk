import { createWaiter, findWaiterByPin } from '../repositories/waiter.repo.js';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, BadRequestError} from '../errors/customErrors.js';

export const registerWaiter = async (req, res) => {
  const { name, pin } = req.body;
  
  // Validar campos de entrada
  if (!name || !pin) {
    throw new BadRequestError("Nombre y PIN son obligatorios");
  }

  // Validar que el PIN tenga exactamente 6 dígitos 
  if (pin.toString().length !== 6) {
    throw new BadRequestError("El PIN debe ser de exactamente 6 dígitos");
  }

  // Verificar si el PIN ya existe antes de crear
  const existingWaiter = await findWaiterByPin(pin);
  if (existingWaiter) {
    // Si el PIN ya existe, lanzamos error y detenemos el proceso
    throw new BadRequestError(`El PIN ${pin} ya está asignado al mesero: ${existingWaiter.name}`);
  }
  
  // Si todo está bien, crear con UUID (dentro del repo)
  await createWaiter({ name, pin });
  
  res.status(StatusCodes.CREATED).json({ 
    message: "Mesero registrado exitosamente" 
  });
};

export const loginWaiter = async (req, res) => {
  const { pin } = req.body;

  // Validar entrada
  if (!pin) {
    throw new BadRequestError("Por favor ingresa un PIN");
  }

  // Buscar en la base de datos
  const waiter = await findWaiterByPin(pin);

  // Validar si existe y está activo
  if (!waiter) {
    
    throw new UnauthenticatedError("PIN incorrecto o mesero no autorizado");
  }

  // Responder con los datos del mesero 
  res.status(StatusCodes.OK).json({ 
    message: "Acceso concedido", 
    waiter: {
      id: waiter.id,
      name: waiter.name
    }
  });
};
