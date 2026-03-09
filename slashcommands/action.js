const { SlashCommandBuilder } = require('discord.js');
const { runAction } = require('../utils/actionHandler');
const { getUserData, updateUserData, grantNeko } = require('../userManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('action')
        .setDescription('Comandos de acción con contador ✨')
        .addSubcommand(sub => sub.setName('hug').setDescription('Abraza a alguien').addUserOption(opt => opt.setName('user').setDescription('A quien abrazar').setRequired(true)))
        .addSubcommand(sub => sub.setName('kiss').setDescription('Besa a alguien').addUserOption(opt => opt.setName('user').setDescription('A quien besar').setRequired(true)))
        .addSubcommand(sub => sub.setName('slap').setDescription('Dale un sape a alguien').addUserOption(opt => opt.setName('user').setDescription('A quien dar un sape').setRequired(true)))
        .addSubcommand(sub => sub.setName('pat').setDescription('Acaricia a alguien').addUserOption(opt => opt.setName('user').setDescription('A quien acariciar').setRequired(true)))
        // ... Todos tus demás subcomandos aquí
    ,
    async execute(interaction) {
        const type = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');

        // 1. Ejecutamos la acción visual (el embed con el GIF)
        const result = await runAction(interaction.client, interaction, type, target, interaction.user);
        
        // 2. --- ☁️ LÓGICA DE SOLAS (100 INTERACCIONES DE ACCIÓN) ---
        const userData = await getUserData(interaction.user.id);
        
        // Sumamos +1 al contador de interacciones sociales
        const nuevoTotal = (userData.interactionsCount || 0) + 1;
        await updateUserData(interaction.user.id, { interactionsCount: nuevoTotal });

        // 3. Verificamos si es el momento del DM y el Neko
        if (nuevoTotal === 100) {
            await grantNeko(interaction.user.id, 'solas', interaction.client);
        }

        // 4. Respondemos con la acción (beso, abrazo, etc.)
        await interaction.reply(result);
    }
};