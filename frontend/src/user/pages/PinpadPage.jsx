import React, { useState } from 'react';
import PinDisplay from '../../user/components/numpad/PinDisplay';
import Numpad from '../../user/components/numpad/Numpad';
import api from '../services/api'; 
import toast from 'react-hot-toast';
import { toastStyles } from "../../config/toastConfig";
import { getShiftByTime } from '..//utils/timeCheck';

/**
 * Componente principal para la autenticación del personal.
 * Gestiona el estado del PIN ingresado y la comunicación con el servidor.
 * 
 * @param {Object} props
 * @param {Function} props.onUnlock - Función callback ejecutada tras una autenticación exitosa.
 */
const PinPage = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [mensaje, setMensaje] = useState('Ingrese su código de acceso de 6 dígitos');
  const [cargando, setCargando] = useState(false);

  /**
   * Actualiza el estado del PIN al presionar un número en el teclado.
   * Restablece los mensajes de estado si existe una advertencia o error previo.
   * 
   * @param {string} num - Dígito presionado.
   */
  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      
      if (mensaje.includes('❌') || mensaje.includes('⚠️') || mensaje.includes('⛔')) {
        setMensaje('Ingrese su código de acceso de 6 dígitos');
      }
    }
  };

  /** Elimina el último dígito ingresado. */
  const handleDelete = () => setPin(prev => prev.slice(0, -1));
  
  /** Restablece el PIN a su estado inicial. */
  const handleClear = () => setPin('');

  /**
   * Procesa la solicitud de autenticación.
   * Verifica la longitud del PIN y el horario de servicio antes de 
   * realizar la petición HTTP al servidor.
   */
  const handleSend = async () => {
    /* Validación de longitud requerida */
    if (pin.length !== 6) {
      return setMensaje('⚠️ DIGITE 6 DÍGITOS');
    }

    /* Validación de horario de operación local */
    const turnoActual = getShiftByTime();
    
    if (turnoActual === "Fuera de horario" || turnoActual === "Cerrado") {
      toast.error('⛔ Fuera de horario de servicio', {
        ...toastStyles,
        duration: 4000,
      });
      setMensaje('❌ FUERA DE HORARIO');

      setTimeout(() => {
        setPin('');
        setMensaje('Ingrese su código de acceso de 6 dígitos'); 
      }, 1500);
    
    return; 
    }

    /* Inicio de transacción HTTP */
    setCargando(true);
    setMensaje('⏳ VERIFICANDO...');

    try {
      const response = await api.post('/waiter/login-waiter', { pin });
      
      const { id, name, is_supervisor } = response.data.waiter;
      setMensaje(`✅ BIENVENIDO, ${name.toUpperCase()}`);
      
      setTimeout(() => {
        onUnlock(id, is_supervisor);
      }, 600);

    } catch (error) {
      const msg = error?.response?.data?.msg;
      
      /* Manejo de excepciones específicas del servidor */
      if (msg?.includes('Restaurante')) {
        toast.error(`⛔ ${msg}`, {
          ...toastStyles,
          duration: 4000,
        });
        setMensaje('Ingrese su código de acceso de 6 dígitos');
      } else {
        setMensaje('❌ PIN INCORRECTO O INACTIVO');
      }
      
      setTimeout(() => setPin(''), 1000);

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] to-[#a5c1db] w-full flex flex-col items-center justify-center p-4">
      <div className={`bg-indigo-50 p-10 rounded-[2rem] shadow-xl flex flex-col items-center w-full max-w-sm border border-gray-100 transition-all duration-300 ${cargando ? 'pointer-events-none' : ''}`}>
        
        <header className="text-center mb-8"> 
            <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-1 block">
                Acceso de Meseros
            </span>
            
            <h1 className="text-2xl font-extrabold text-gray-800">
                Ingrese su PIN
            </h1>
            
            <p className={`text-sm mt-2 max-w-[200px] mx-auto leading-tight transition-colors duration-300 ${
                mensaje.includes('❌') ? 'text-red-500 font-bold' : 
                mensaje.includes('✅') ? 'text-green-600 font-bold' : 
                mensaje.includes('⚠️') ? 'text-orange-500 font-bold' :
                mensaje.includes('⛔') ? 'text-red-600 font-bold' : 
                'text-gray-600'
            }`}>
                {mensaje}
            </p>
        </header>

        <PinDisplay pinLength={pin.length} />
        
        <Numpad 
          onNumberClick={handleNumberClick} 
          onDeleteClick={handleDelete} 
          onClear={handleClear}
          onSend={handleSend}
          cargando={cargando} 
        />
        
      </div>
    </div>
  );
};

export default PinPage;