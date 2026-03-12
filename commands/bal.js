const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../userManager.js');

module.exports = {
    name: 'bal',
    aliases: ['balance', 'money'],
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Revisa tu monedero y cuenta bancaria en las sombras.')
        .addUserOption(option => option.setName('usuario').setDescription('Ver el balance de alguien más')),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        const target = isSlash ? (input.options.getUser('usuario') || author) : (input.mentions.users.first() || author);
        
        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '🌑';
        };

        const data = await getUserData(target.id);
        
        const wallet = data.wallet || 0;
        const bank = data.bank || 0;
        const total = wallet + bank;

        const balEmbed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ 
                name: `⊹ Bóveda Personal: ${target.username} ⊹`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(
                `${getE()} *“Los recursos son poder en la oscuridad...”* ${getE()}\n\n` +
                `${getE()} **Efectivo:** \`${wallet.toLocaleString()}\` Flores\n` +
                `${getE()} **Banco:** \`${bank.toLocaleString()}\` Flores\n\n` +
                `${getE()} **Patrimonio Total:** \`${total.toLocaleString()}\` Flores`
            )
            .setTimestamp()
            .setFooter({ text: `Rockstar ⊹ Nightfall` });

        return input.reply({ embeds: [balEmbed] });
    }
};
