import apiKiosk from "./api"; 

export const sendSuggestion = async (text, ratingContext, waiterId, tableNumber) => {
  const { data } = await apiKiosk.post("/suggestions/register-suggestion", {
    comment: text,
    rating_context: ratingContext,
    waiter_id: waiterId,       // ✅
    table_number: tableNumber, // ✅
  });
  return data;
};