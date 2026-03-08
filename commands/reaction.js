const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reaction',
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('🎀 Expresa tus sentimientos y emociones')
        .addSubcommand(s => s.setName('cry').setDescription('😢 Estás llorando...'))
        .addSubcommand(s => s.setName('dance').setDescription('💃 ¡A bailar!'))
        .addSubcommand(s => s.setName('blush').setDescription('😳 Te sonrojaste'))
        .addSubcommand(s => s.setName('smile').setDescription('😊 Una sonrisa Rockstar'))
        .addSubcommand(s => s.setName('sleep').setDescription('😴 Tienes sueñito'))
        .addSubcommand(s => s.setName('pout').setDescription('😒 Haces un puchero'))
        .addSubcommand(s => s.setName('laugh').setDescription('😂 Te mueres de risa'))
        .addSubcommand(s => s.setName('happy').setDescription('✨ ¡Estás muy feliz!')),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        
        // Obtener la emoción
        let sub;
        if (isSlash) {
            sub = input.options.getSubcommand();
        } else {
            sub = args[0]?.toLowerCase();
        }

        if (!sub) {
            return input.reply("╰┈➤ 🌸 **¡Holi!** Dime cómo te sientes hoy. ✨");
        }

        // Obtener el apodo del autor
        const member = input.guild.members.cache.get(user.id);
        const name = member ? member.displayName : user.username;

        // Diccionario de mensajes de estado
        const reactions = {
            cry: "está llorando... ¿alguien le da un abrazo? 🥺",
            dance: "se puso a bailar con mucha energía. ✨",
            blush: "se sonrojó muchísimo... ¡qué linda! 😳",
            smile: "nos regaló una sonrisa hermosa. 😊",
            sleep: "se quedó dormidita en un rincón... 💤",
            pout: "está haciendo un puchero muy tierno. 😒",
            laugh: "no puede parar de reírse. 😂",
            happy: "se siente la persona más feliz del mundo. 💖"
        };

        const frase = reactions[sub] || "está expresando sus emociones.";

        const reactionEmbed = new EmbedBuilder()
            .setTitle(`‧₊˚ ✨ Estado Rockstar: ${sub.toUpperCase()} ✨ ˚₊‧`)
            .setColor('#CDB4DB') // Un lila suave para emociones
            .setDescription(
                `*“Escuchando los latidos del corazón...”* 🎀\n\n` +
                `**${name}** ${frase}\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧`
            )
            .setImage(`https://neliel-api.vercel.app/api/${sub}`)
            .setFooter({ 
                text: `📺 Anime: Emotion Style ♡ • Expresado por ${name}`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        return input.reply({ embeds: [reactionEmbed] });
    }
};
