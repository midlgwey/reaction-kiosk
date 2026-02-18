
import { useState, useEffect } from "react";
import api from "../../services/api";

export function useSuggestionsList() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await api.get("/suggestions/view-suggestion");
      setComments(res.data);
    } catch (err) {
      console.error("Error cargando sugerencias", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return { comments, loading, refresh: fetchComments };
}