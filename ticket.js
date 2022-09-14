const Discord = require("discord.js");
const { aliases } = require("./ping");
const client = new Discord.Client({ intents: [1, 512, 32768, 2, 128] });
const config = require("./config.json");


const teste = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildBans,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
	],
	partials: [Discord.Partials.Channel],
});


teste.on('ready', () => {
	const status = [
		'🥇 Entre em nosso \n server: https://discord.gg/VZaTQgn.',
		'💌 Contato: \n redenylon@gmail.com.',
		'🔨 Os melhores jogadores \n estão aqui.'
	];
	i = 0;
	teste.user.setActivity(status[0]);
	setInterval(() => teste.user.setActivity(`${status[i++ % status.length]}`, {
		type: 'PLAYING',
	}), 1000 * 60 * 15);
	teste.user.setStatus('online');
	console.log('😍 ' + teste.user.username + ' started working!');
});

teste.on('messageCreate', async (msg) => {
	if (msg.author.bot) return;
	if (!msg.member.permissions.has('ADMINISTRATOR')) return;
	if (msg.channel.type === Discord.ChannelType.DM) return;

	const prefix = ticketPrefix;

	if (!msg.content.startsWith(prefix)) return;
	const ticketChannel = teste.channels.cache.find(channel => channel.id === ticketChannelId);
	msg.delete();
	const row = new Discord.ActionRowBuilder()
		.addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('ticket')
				.setLabel('Criar Ticket')
				.setStyle('Secondary'),
		);

        const embed = new Discord.EmbedBuilder()
		.setColor('#2f3136')
		.setImage('https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png')
		.setAuthor({ name: 'Criar ticket de atendimento | Borghesi', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png', url: 'https://discord.gg/VZaTQgn' })
		.setURL('https://discord.gg/VZaTQgn')
		.setDescription('Para dúvidas, suporte, contato profissional, orçamentos e compras.')
		.setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });

	ticketChannel.send({ ephemeral: true, embeds: [embed], components: [row] });
});


teste.on('interactionCreate', async interaction => {
	if (interaction.customId === 'ticket') {
		if (!interaction.isButton()) return;
		const guild = teste.guilds.cache.get(interaction.guild.id);
		const guildChannels = guild.channels.cache;
		const userFirstName = interaction.user.username.split(' ')[0].toLowerCase();
		const interactionChannelName = `ticket-${userFirstName}`;
		const adminAlertChannel = teste.channels.cache.find(channel => channel.id === adminChannelId);
		const errorEmbed = new Discord.EmbedBuilder()
			.setDescription('❌ Você já possui um ticket aberto! Encerre o ticket atual para poder abrir um novo.')
			.setColor('#2f3136')
			.setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });

		const sucessEmbed = new Discord.EmbedBuilder()
			.setDescription('✅ Você foi mencionado no canal correspondente ao seu ticket.')
			.setColor('#2f3136')
			.setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });

		const adminMessage = new Discord.EmbedBuilder()
			.setDescription(`☄️ Um ticket foi aberto! ${interaction.user.id}`)
			.addFields([
				{
					name: '😀 Usuário:',
					value: `${interaction.user.username}`,
					inline: true
				}
			])
			.setColor('#2f3136')
			.setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });

            for (const channel of guildChannels.values()) {
                if(channel.name.startsWith('ticket')) {
                    if(channel.topic === interaction.user.id) {
                        return interaction.reply({ ephemeral: true, embeds: [errorEmbed] });
                    }
                }
            }
    
            adminAlertChannel.send({ ephemeral: true, embeds: [adminMessage] });
    
            guild.channels.create({
                name: interactionChannelName,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                    }
                ],
                type: Discord.ChannelType.GuildText,
                //parent: 'xxx',
            }).then(async channel => {
                channel.setTopic(interaction.user.id);
                const embed = new Discord.EmbedBuilder()
                    .setDescription('☄️ Você solicitou um ticket. Entraremos em contato o mais rápido possível, aguarde. Clique no botão vermelho para encerrar o ticket.')
                    .setColor('#2f3136')
                    .setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });
    
                const deleteButton = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel('Cancelar Ticket')
                            .setStyle('Danger'),
                    );
    
                await channel.send({ ephemeral: true, embeds: [embed], components: [deleteButton], content: `||<@${interaction.user.id}>||` });
                interaction.reply({ ephemeral: true, embeds: [sucessEmbed] });
            })
        }
        if (interaction.customId === 'delete') {
            interaction.channel.delete();
            const adminAlertChannel = teste.channels.cache.find(channel => channel.id === adminChannelId);
            const deleteMessage = new Discord.EmbedBuilder()
                .setDescription(`❌ Ticket encerrado! ${interaction.user.id}`)
                .addFields([
                    {
                        name: '😀 Usuário:',
                        value: `${interaction.user.username}`,
                        inline: true
                    }
                ])
                .setColor('#2f3136')
                .setFooter({ text: 'Borghesi © 2022', iconURL: 'https://cdn.discordapp.com/attachments/1004394150000603138/1005179016220770344/cow.png' });
    
            await interaction.user.send({ ephemeral: true, embeds: [deleteMessage] }).catch(() => {
                adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
                return false;
            });
            adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
        }
    });


	client.login(config.token)

