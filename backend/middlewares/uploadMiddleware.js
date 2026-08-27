
import multer from 'multer';
import path from 'path';

// Configuración de dónde y cómo se guardarán los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegúrate de tener una carpeta llamada 'uploads' en la raíz de tu backend
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único para evitar que se sobrescriban archivos con el mismo nombre
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro opcional para aceptar solo imágenes o PDFs (puedes ajustarlo)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG) o PDF.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
});

export default upload;