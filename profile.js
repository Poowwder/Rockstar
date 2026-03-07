const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js'); // Asegúrate de que la ruta es correcta

const ICONS = {
    profile: '👤',
    edit: '✏️',
    background: '🖼️',
    error: '❌',
};

const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Gestiona tu perfil o el de otro usuario.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Muestra tu perfil o el de otro usuario.')
                .addUserOption(option => option.setName('usuario').setDescription('Usuario del que ver el perfil.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edita tu perfil.')
                .addStringOption(option => option.setName('bio').setDescription('Nueva biografía para tu perfil.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setbg')
                .setDescription('Establece un fondo para tu perfil.')
                .addStringOption(option => option.setName('url').setDescription('URL de la imagen de fondo.').setRequired(true))),
    category: 'utility',
    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'view') {
            return this.viewProfile(interaction);
        } else if (sub === 'edit') {
            return this.editProfile(interaction);
        } else if (sub === 'setbg') {
            return this.setBackground(interaction);
        }
    },

    async viewProfile(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const userId = user.id;

        const data = getUserData(userId);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.profile} Perfil de ${user.username}`)
            .setColor(COLORS.primary)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Usuario', value: user.tag, inline: true },
                { name: 'ID', value: userId, inline: true },
                { name: 'Nivel', value: data.level.toString(), inline: true },
                { name: 'Biografía', value: data.bio || 'Sin biografía.', inline: false }
            );

        if (data.profileBackground) {
            embed.setImage(data.profileBackground);
        }

        await interaction.reply({ embeds: [embed] });
    },

    async editProfile(interaction) {
        const userId = interaction.user.id;
        const bio = interaction.options.getString('bio');

        if (!bio) {
            return interaction.reply({ content: `${ICONS.error} Debes proporcionar una biografía.`, flags: MessageFlags.Ephemeral });
        }

        if (bio.length > 256) {
            return interaction.reply({ content: `${ICONS.error} La biografía no puede superar los 256 caracteres.`, flags: MessageFlags.Ephemeral });
        }

        const data = getUserData(userId);
        data.bio = bio;
        updateUserData(userId, data);

        await interaction.reply({ content: `${ICONS.edit} Biografía actualizada a: ${bio}`, flags: MessageFlags.Ephemeral });
    },

    async setBackground(interaction) {
        const userId = interaction.user.id;
        const url = interaction.options.getString('url');

        if (!url.startsWith('http') && !url.startsWith('https')) {
            return interaction.reply({ content: `${ICONS.error} La URL debe empezar con http o https.`, flags: MessageFlags.Ephemeral });
        }

        const data = getUserData(userId);
        data.profileBackground = url;
        updateUserData(userId, data);

        await interaction.reply({ content: `${ICONS.background} Fondo de perfil actualizado.`, flags: MessageFlags.Ephemeral });
    },
};

/*
COMMAND: profile
CATEGORY: utility

!!profile view [usuario] - Muestra el perfil propio o el del usuario mencionado.
!!profile edit <bio> - Edita la biografía del perfil.
!!profile setbg <url> - Establece una imagen de fondo para el perfil.

USAGE
/profile view
/profile view [usuario: @usuario]
/profile edit [bio: string]
/profile setbg [url: string]
*/