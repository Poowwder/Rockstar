// Añade esta opción al comando reset en el bloque de 'levels'
if (tipo === 'levels') {
    data.level = 1;
    data.xp = 0;
    data.lastChatXP = 0; // Limpia también el cooldown de chat
    mensaje = "Se ha reseteado su nivel, XP y cooldown de chat.";
}