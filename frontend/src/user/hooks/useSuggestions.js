import { useState } from 'react';
import { sendSuggestion } from '../services/suggestionServices.js';

export const useSuggestions = (ratingActual, onSuccess, onError) => {
    
  const [text, setText] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      // Pasamos 'text' al servicio
      await sendSuggestion(text, ratingActual);
      setText(""); 
      if (onSuccess) onSuccess(); 
    } catch (err) {
      console.error("Error en el hook:", err);
      if (onError) onError(); 
    } finally {
      setLoading(false);
    }
  };

  return {
    text,   // Retornamos 'text'
    setText, // Retornamos 'setText'
    loading,
    handleSend
  };
};