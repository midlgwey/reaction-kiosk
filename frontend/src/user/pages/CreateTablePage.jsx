import React, { useState } from 'react';
import Numpad from '../../user/components/numpad/Numpad'; // Reciclamos tu Numpad

const CreateTable = ({ onNext }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [mensaje, setMensaje] = useState('Indique la mesa de entrega');

  const handleNumberClick = (num) => {
    // Permitimos hasta 3 dígitos para la mesa (ej. Mesa 105)
    if (tableNumber.length < 3) {
      setTableNumber(prev => prev + num);
    }
  };

  const handleDelete = () => setTableNumber(prev => prev.slice(0, -1));
  const handleClear = () => setTableNumber('');

  const handleSend = () => {
    if (tableNumber === '' || parseInt(tableNumber) === 0) {
      return setMensaje('⚠️ INGRESE UNA MESA VÁLIDA');
    }
    
    // Aquí no ocupas API, solo pasas el dato al flujo principal
    onNext(tableNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] to-[#a5c1db] w-full flex flex-col items-center justify-center p-4">
      <div className="bg-indigo-50 p-10 rounded-[2rem] shadow-xl flex flex-col items-center w-full max-w-sm border border-gray-100">
        
        <header className="text-center mb-8"> 
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-1 block">
            Configuración de Servicio
          </span>
          <h1 className="text-2xl font-extrabold text-gray-800">
            Número de Mesa
          </h1>
          <p className={`text-sm mt-2 font-bold ${mensaje.includes('⚠️') ? 'text-orange-500' : 'text-gray-600'}`}>
            {mensaje}
          </p>
        </header>

    
        <div className="flex justify-center items-center bg-white w-full h-20 rounded-2xl mb-8 border-2 border-indigo-100 shadow-inner">
          <span className="text-5xl font-black text-indigo-600">
            {tableNumber || <span className="text-gray-200">00</span>}
          </span>
        </div>
        
        <Numpad 
          onNumberClick={handleNumberClick} 
          onDeleteClick={handleDelete} 
          onClear={handleClear}
          onSend={handleSend}
          cargando={false} // Aquí no hay carga de API
        />
      </div>
    </div>
  );
};

export default CreateTable;