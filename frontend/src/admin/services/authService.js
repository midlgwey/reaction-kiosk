import api from "./api";

export const logoutAdminService = async () => {
  // Aquí solo nos encargamos de la petición HTTP
  const response = await api.post("/admin/logout-admin");
  return response.data;
};