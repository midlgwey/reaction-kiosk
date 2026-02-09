import { body, validationResult } from 'express-validator';
import { BadRequestError } from '../errors/customErrors.js';

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

export const validateRegisterInputAdmin = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .matches(nameRegex).withMessage('El nombre solo debe contener letras y acentos'),

  body('lastname')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .matches(nameRegex).withMessage('El apellido solo debe contener letras y acentos'),

  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Formato de correo electrónico no válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

export const validateLoginInputAdmin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Formato de correo electrónico no válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

export const withValidationErrors = (validateValues) => [
  ...validateValues,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      throw new BadRequestError(errorMessages.join(', '));
    }
    next();
  },
];
