import React, { useState } from 'react';
import PinDisplay from '../../user/components/numpad/PinDisplay';
import Numpad from '../../user/components/numpad/Numpad';
import api from '../services/api'; 

const PinPage = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [mensaje, setMensaje] = useState('Ingrese su código de acceso de 6 dígitos');
  const [cargando, setCargando] = useState(false);

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      // Limpia los mensajes de error cuando el usuario vuelve a escribir
      if (mensaje.includes('❌') || mensaje.includes('⚠️')) {
        setMensaje('Ingrese su código de acceso de 6 dígitos');
      }
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));
  const handleClear = () => setPin('');

  const handleSend = async () => {
    if (pin.length !== 6) {
      return setMensaje('⚠️ DIGITE 6 DÍGITOS');
    }

    setCargando(true);
    setMensaje('⏳ VERIFICANDO...');

    try {
      // Petición al endpoint de validación de meseros
      const response = await api.post('/waiter/login-waiter', { pin });
      
      // Extraemos el id y nombre que manda el backend
      const { id, name } = response.data.waiter;
      
      setMensaje(`✅ BIENVENIDO, ${name.toUpperCase()}`);
      
      // Pausa para que se lea el mensaje antes de cambiar de pantalla
      setTimeout(() => {
        onUnlock(id); 
      }, 600);

    } catch (error) {
      const msg = error?.response?.data?.msg;
      setMensaje(msg?.includes('Restaurante') ? `⛔ ${msg}` : '❌ PIN INCORRECTO O INACTIVO');
      setTimeout(() => setPin(''), 1000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] to-[#a5c1db] w-full flex flex-col items-center justify-center p-4">
      {/* 
        Contenedor principal del PIN con fondo, bordes redondeados y sombra
      */}
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
                mensaje.includes('⛔') ? 'text-red-600 font-bold' : // ✅
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