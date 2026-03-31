// useLatestSuggestions.js
import { useState, useEffect } from "react";
import api from "../../services/api";

export function useLatestSuggestions() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/suggestions/latest-suggestions");
        setComments(res.data);
      } catch (err) {
        console.error("Error cargando últimas sugerencias", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { comments, loading };
}