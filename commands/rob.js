const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'rob',
    aliases: ['robar', 'steal'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('🕵️ Intenta robarle flores a otro usuario (¡con riesgo!)')
        .addUserOption(option => option.setName('usuario').setDescription('Tu víctima').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const member = input.member;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        const targetMember = isSlash ? input.options.getMember('usuario') : input.mentions.members.first();

        if (!target || target.id === author.id) return input.reply("╰┈➤ ❌ No puedes robarte a ti misma...");
        if (target.bot) return input.reply("╰┈➤ 🤖 Los bots no guardan flores en sus bolsillos.");

        let userData = await getUserData(author.id);
        let targetData = await getUserData(target.id);

        if (targetData.wallet < 500) return input.reply(`╰┈➤ **${targetMember.displayName}** es muy pobre, no vale la pena el riesgo.`);
        if (userData.wallet < 200) return input.reply("╰┈➤ ❌ Necesitas al menos `200 🌸` en mano por si te atrapan y debes pagar la multa.");

        const exito = Math.random() > 0.5; // 50% de probabilidad
        const robEmbed = new EmbedBuilder().setTimestamp();

        if (exito) {
            const robado = Math.floor(Math.random() * (targetData.wallet * 0.4)) + 100; // Roba hasta el 40%
            userData.wallet += robado;
            targetData.wallet -= robado;
            
            robEmbed.setTitle('🧤 ¡Robo Exitoso!')
                .setColor('#B5EAD7') // Verde pastel
                .setThumbnail('https://i.pinimg.com/originals/94/23/e8/9423e85744249a5b6d573d8753232811.gif')
                .setDescription(
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                    `**${member.displayName}**, fuiste muy sigilosa...\n\n` +
                    `╰┈➤ Le robaste a **${targetMember.displayName}**\n` +
                    `╰┈➤ Ganancia: **${robado.toLocaleString()} 🌸**\n\n` +
                    `*¡Corre antes de que se den cuenta!* 💨\n\n` +
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
                );
        } else {
            const multa = 500;
            userData.wallet = Math.max(0, userData.wallet - multa);
            
            robEmbed.setTitle('🚫 ¡Te atraparon!')
                .setColor('#FF9AA2') // Rojo/Rosa pastel
                .setThumbnail('https://i.pinimg.com/originals/f3/f5/63/f3f56363a0336215707a276856037e81.gif')
                .setDescription(
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n` +
                    `**${member.displayName}**, fuiste muy ruidosa...\n\n` +
                    `╰┈➤ **${targetMember.displayName}** te vio y llamó a la policía.\n` +
                    `╰┈➤ Pagaste una multa de: **${multa} 🌸**\n\n` +
                    `*¡Qué vergüenza! Mejor suerte la próxima vez.* 😭\n\n` +
                    `୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`
                );
        }

        await updateUserData(author.id, userData);
        await updateUserData(target.id, targetData);

        return input.reply({ embeds: [robEmbed] });
    }
};