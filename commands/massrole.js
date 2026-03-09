module.exports = {
    name: 'massrole',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) return message.reply('🌸 Solo admins.');
        const action = args[0]; // add o remove
        const type = args[1]; // all, humans, bots
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

        if (!['add', 'remove'].includes(action) || !role) return message.reply('🌸 Uso: `!!massrole [add/remove] [all/humans/bots] [@rol]`');

        message.reply('⏳ Procesando... esto puede tardar un poco.');
        const members = await message.guild.members.fetch();
        let count = 0;

        for (const m of members.values()) {
            if (type === 'humans' && m.user.bot) continue;
            if (type === 'bots' && !m.user.bot) continue;
            try {
                if (action === 'add' && !m.roles.cache.has(role.id)) { await m.roles.add(role); count++; }
                if (action === 'remove' && m.roles.cache.has(role.id)) { await m.roles.remove(role); count++; }
            } catch {}
        }
        message.reply(`✅ Acción masiva completada para **${count}** usuarios. ✨`);
    }
};