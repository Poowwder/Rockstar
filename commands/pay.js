const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Envía flores de tu cartera a otro usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('¿A quién quieres enviarle flores?').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad de flores a enviar').setRequired(true).setMinValue(1)),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const cantidad = interaction.options.getInteger('cantidad');
        const userId = interaction.user.id;

        // Evitar enviarse a uno mismo
        if (target.id === userId) return interaction.reply({ content: "❌ No puedes enviarte flores a ti mismo/a.", ephemeral: true });
        if (target.bot) return interaction.reply({ content: "❌ Los bots no aceptan flores... ¡aunque son lindas!", ephemeral: true });

        const userData = await getUserData(userId);
        const targetData = await getUserData(target.id);

        // Verificar saldo
        if (userData.wallet < cantidad) {
            return interaction.reply({ content: `❌ No tienes suficientes flores. Te faltan **${cantidad - userData.wallet} 🌸**.`, ephemeral: true });
        }

        // --- LÓGICA DE APODOS Y ESTÉTICA ---
        const memberEmisor = interaction.guild.members.cache.get(userId);
        const memberReceptor = interaction.guild.members.cache.get(target.id);
        const apodoEmisor = memberEmisor?.nickname || interaction.user.username;
        const apodoReceptor = memberReceptor?.nickname || target.username;

        // GIF Aesthetic de transferencia o sobre con flores
        const payAesthetic = "https://i.pinimg.com/originals/7b/0b/4b/7b0b4b8b8b8b8b8b8b8b8b8b8b8b8b8b.gif"; // Sobrecito Cute

        // Transacción
        userData.wallet -= cantidad;
        targetData.wallet += cantidad;

        await updateUserData(userId, userData);
        await updateUserData(target.id, targetData);

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `💸 Transferencia de ${apodoEmisor}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTitle('✨ ¡Flores Enviadas!')
            .setThumbnail(payAesthetic)
            .setColor(userData.profileColor || '#FFB6C1')
            .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n**${apodoEmisor}** ha enviado **${cantidad} 🌸** a **${apodoReceptor}**.\n\n*¡Qué generoso/a! El jardín sigue creciendo.* ✨\n\n**Tu nuevo saldo:** \`${userData.wallet} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Economy 🎀`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};