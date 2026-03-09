const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'pay',
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('💸 Envía flores a otro usuario')
        .addUserOption(o => o.setName('usuario').setDescription('¿A quién le das flores?').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a enviar').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        const amount = isSlash ? input.options.getInteger('cantidad') : parseInt(input.content.split(/ +/)[2]);

        if (!target || target.id === author.id || target.bot) return input.reply("╰┈➤ ❌ Acción inválida, linda.");
        if (!amount || amount <= 0) return input.reply("╰┈➤ ❌ Indica una cantidad válida.");

        let senderData = await getUserData(author.id);
        if (senderData.wallet < amount) return input.reply("╰┈➤ ❌ No tienes suficientes flores en tu cartera.");

        let targetData = await getUserData(target.id);
        senderData.wallet -= amount;
        targetData.wallet += amount;

        await updateUserData(author.id, senderData);
        await updateUserData(target.id, targetData);

        const embed = new EmbedBuilder()
            .setTitle('💸 Transferencia Exitosa')
            .setColor('#FFB6C1')
            .setThumbnail('https://i.pinimg.com/originals/4d/30/1e/4d301e523315f013346e9198305c5678.gif')
            .setDescription(`**${input.member.displayName}** le envió \`${amount} 🌸\` a **${input.guild.members.cache.get(target.id).displayName}**.\n\n*¡Qué generosa!* ✨`)
            .setTimestamp();

        return input.reply({ embeds: [embed] });
    }
};