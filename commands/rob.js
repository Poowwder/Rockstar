const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Intenta robarle algunas flores a otro usuario 😈')
        .addUserOption(opt => opt.setName('usuario').setDescription('¿A quién quieres robar?').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const userId = interaction.user.id;

        if (target.id === userId) return interaction.reply({ content: "❌ No puedes robarte a ti mismo... eso sería muy raro.", ephemeral: true });
        if (target.bot) return interaction.reply({ content: "❌ Los bots no cargan carteras, solo circuitos.", ephemeral: true });

        const userData = await getUserData(userId);
        const targetData = await getUserData(target.id);

        // Cooldown de 2 horas para no spamear robos
        const now = Date.now();
        const cooldown = 7200000; 
        if (now - (userData.lastRob || 0) < cooldown) {
            const restante = Math.ceil((cooldown - (now - userData.lastRob)) / 60000);
            return interaction.reply({ content: `⏳ ¡La policía te busca! Espera **${restante} minutos** antes de otro atraco.`, ephemeral: true });
        }

        if (targetData.wallet < 500) {
            return interaction.reply({ content: `❌ **${target.username}** es demasiado pobre para robarle... Ten un poco de piedad.`, ephemeral: true });
        }

        const memberEmisor = interaction.guild.members.cache.get(userId);
        const memberReceptor = interaction.guild.members.cache.get(target.id);
        const apodoEmisor = memberEmisor?.nickname || interaction.user.username;
        const apodoReceptor = memberReceptor?.nickname || target.username;

        // Probabilidad del 40% de éxito
        const exito = Math.random() < 0.4;
        userData.lastRob = now;

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `🕶️ Intento de atraco: ${apodoEmisor}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setFooter({ 
                text: `${interaction.guild.name} • Rockstar Underworld 🖤`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        if (exito) {
            // Roba entre el 10% y el 30% de la cartera de la víctima
            const porcentaje = Math.random() * (0.3 - 0.1) + 0.1;
            const robado = Math.floor(targetData.wallet * porcentaje);

            userData.wallet += robado;
            targetData.wallet -= robado;

            embed.setTitle('💰 ¡Robo Exitoso!')
                .setColor('#2ECC71')
                .setThumbnail("https://i.pinimg.com/originals/0a/16/64/0a16646bc37ba395f8502699173d9e87.gif") // GIF Gatito Ladrón
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n**${apodoEmisor}** se escabulló y le robó **${robado} 🌸** a **${apodoReceptor}**.\n\n*¡Corre antes de que te atrapen!*\n\n**Tu nuevo saldo:** \`${userData.wallet} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`);
        } else {
            // Multa: Pierde una cantidad fija por ser atrapado y se la da a la víctima
            const multa = 1000;
            userData.wallet = Math.max(0, userData.wallet - multa);
            targetData.wallet += multa;

            embed.setTitle('🚨 ¡Atrapado/a!')
                .setColor('#E74C3C')
                .setThumbnail("https://i.pinimg.com/originals/72/3d/8c/723d8c199580459c049d5d51d45903b4.gif") // GIF Anime Arresto
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n**${apodoEmisor}** intentó robar a **${apodoReceptor}**, ¡pero tropezó con una maceta!\n\nLa policía le obligó a pagar **${multa} 🌸** a la víctima como compensación.\n\n**Tu nuevo saldo:** \`${userData.wallet} 🌸\`\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`);
        }

        await updateUserData(userId, userData);
        await updateUserData(target.id, targetData);

        return interaction.reply({ embeds: [embed] });
    }
};