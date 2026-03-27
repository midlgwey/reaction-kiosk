import React from 'react';

const PinDisplay = ({ pinLength }) => {
  const dots = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex justify-center gap-3 mb-8">
      {dots.map((index) => (
        <div key={index} className="flex flex-col items-center gap-2">
          {/* El punto que aparece cuando se teclea */}
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 
            ${index < pinLength ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}`} 
          />
          {/* La línea base de la imagen */}
          <div className={`w-8 h-0.5 rounded-full ${index < pinLength ? 'bg-indigo-500' : 'bg-gray-200'}`} />
        </div>
      ))}
    </div>
  );
};

export default PinDisplay;