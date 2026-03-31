import { useState } from 'react';
import { sendSuggestion } from '../services/suggestionServices.js';

export const useSuggestions = (ratingActual, waiterId, tableNumber, onSuccess, onError) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await sendSuggestion(text, ratingActual, waiterId, tableNumber); 
      setText("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error en el hook:", err);
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  return { text, setText, loading, handleSend };
};