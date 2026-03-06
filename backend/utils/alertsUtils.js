/**
 * Envía una notificación automática a un chat de Telegram mediante la API de Bots.
 * Diseñado para integrarse en flujos de trabajo de Node.js (v18+).
 * * @param {string} mensaje - El texto descriptivo de la alerta que se enviará al dispositivo móvil.
 */
export const sendAlertTelegram = async (mensaje) => {
  // Extracción de variables de entorno (Configuradas en el panel de Render)
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Validación de configuración: Evita intentos de envío si las variables no están presentes
  if (!token || !chatId) {
    console.error(' [TELEGRAM] Configuración incompleta: Verifique TELEGRAM_TOKEN y TELEGRAM_CHAT_ID.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'Markdown' // Permite el uso de emojis y formatos básicos
      }),
    });

    // Manejo de la respuesta de la API de Telegram
    if (response.ok) {
      console.log('[TELEGRAM] Notificación enviada exitosamente.');
    } else {
      const errorData = await response.json();
      console.error('[TELEGRAM] Error en la API:', errorData.description || errorData);
    }
  } catch (error) {
    // Manejo de errores de red o excepciones durante la ejecución
    console.error('[TELEGRAM] Fallo de conexión:', error.message);
  }
};