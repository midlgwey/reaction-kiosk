import apiKiosk from "./api"; 

export const sendSuggestion = async (text, ratingContext) => {
  // Solo hace la petición técnica
  const { data } = await apiKiosk.post("/suggestions/register-suggestion", {
    comment: text,
    rating_context: ratingContext,
  });
  return data;
};