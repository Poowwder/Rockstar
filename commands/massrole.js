const { PermissionFlagsBits } = require('discord.js');
const { sendAuditLog } = require('../functions/auditLogger.js'); // Importamos el logger maestro

module.exports = {
    name: 'massrole',
    description: 'Añade o remueve un rol de forma masiva a humanos, bots o a todos.',
    async execute(message, args) {
        // --- 🛡️ VALIDACIÓN DE PERMISOS ---
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('╰┈➤ ❌ Solo los Administradores pueden ejecutar una alteración masiva.');
        }

        const action = args[0]; // add o remove
        const type = args[1]; // all, humans, bots
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

        if (!['add', 'remove'].includes(action) || !['all', 'humans', 'bots'].includes(type) || !role) {
            return message.reply('╰┈➤ ⚠️ **Uso correcto:** `!!massrole [add/remove] [all/humans/bots] [@rol]`');
        }

        // --- ⚖️ VERIFICACIÓN DE JERARQUÍA ---
        if (message.member.roles.highest.position <= role.position) {
            return message.reply('╰┈➤ ❌ No puedes manipular un rol de igual o mayor jerarquía que el tuyo.');
        }

        const initialMsg = await message.reply('╰┈➤ ⏳ **Procesando alteración masiva...** Las sombras están trabajando.');

        try {
            const members = await message.guild.members.fetch();
            let count = 0;

            for (const m of members.values()) {
                if (type === 'humans' && m.user.bot) continue;
                if (type === 'bots' && !m.user.bot) continue;

                try {
                    if (action === 'add' && !m.roles.cache.has(role.id)) {
                        await m.roles.add(role);
                        count++;
                    } else if (action === 'remove' && m.roles.cache.has(role.id)) {
                        await m.roles.remove(role);
                        count++;
                    }
                } catch (err) {
                    // Se ignora si no se puede editar a un usuario específico (jerarquía del bot)
                    continue;
                }
            }

            const statusAction = action === 'add' ? 'asignado' : 'removido';
            await initialMsg.edit(`╰┈➤ 🌑 **Protocolo completado.** El rol \`${role.name}\` ha sido ${statusAction} a **${count}** entidades.`);

            // --- 👁️ SISTEMA DE LOGS (ROCKSTAR AUDITORÍA) ---
            await sendAuditLog(message.guild, {
                title: '⊹ Alteración Masiva de Roles ⊹',
                description: 
                    `**Acción:** \`${action.toUpperCase()}\`\n` +
                    `**Objetivo:** \`${type.toUpperCase()}\`\n` +
                    `**Rol afectado:** ${role.name} (\`${role.id}\`)\n` +
                    `**Entidades procesadas:** \`${count}\`\n` +
                    `**Moderador:** ${message.author.tag}\n` +
                    `> *Se ha ejecutado un cambio de roles a gran escala en el dominio.*`,
                color: '#1a1a1a',
                icon: message.author.displayAvatarURL()
            });

        } catch (error) {
            console.error("Error en massrole:", error);
            await initialMsg.edit('╰┈➤ ❌ Se produjo una falla crítica en la manipulación masiva.');
        }
    }
};
