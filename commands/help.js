const {prefix} = require('../auth.json');

module.exports = {
	name: 'help',
	description: 'Help for commands.',
	execute(message, args) {
		message.channel.send("```\nyky bot help:\n- Search command: !search {nickname|last name [first name]}\n"
			+"You can search for either nickname alone or last and first name.\n"
			+"You can use reactions to filter multiple results.\n"
			+"- Special command: !yky\n```")
	}
}
