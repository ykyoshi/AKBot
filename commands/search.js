module.exports = {
	name: 'search',
	description: 'Search',
	args: true,
	execute(message, args) {
		const sqlite3 = require('sqlite3').verbose();
		const Discord = require('discord.js');
		let sqlCount;
		let sqlSelect;
		// Database variables.
		var rid = '';			// Members table id.
		var rkanji = '';		// Name in kanji.
		var rlastname = '';		// Last name.
		var rfirstname = '';	// First name.
		var rnick = '';			// Nickname (not displayed, only used for queries).
		var rbdate = '';		// Birthdate.
		var rbplace = '';		// Birthplace (unused).
		var rteam1 = '';		// Team 1.
		var rteam2 = '';		// Team 2 (may be null).
		var rdebuted = '';		// Debut date.
		var rgen = '';			// Generation.
		var rsnsid = '';		// SNS table id.
		var rtwitter = '';		// Twitter handle.
		var rig = '';			// Instagram handle.
		var rgogo = '';			// 7gogo handle.
		var rsr = '';			// Showroom handle.
		// Programmatically set variables.
		var date1;				// Current date (for age).
		var date2;				// Birthdate (for age).
		var age = '';			// Age (current date - birthdate).
		var rgroup1 = '';		// Team 1 group.
		var rgroup2 = '';		// Team 2 group (may be null).
		var rcolor = '';		// Embed color.
		var ykyspecial = '';	// Special variable for disambiguation.
		var result = 0;			// Number of results.

		// Search for nickname, last name or first name if there's only one argument.
		if (args[1] == null) {
			console.log('Searching for: ' + args[0] + '...');
			sqlCount = `SELECT COUNT(*) AS namesCount FROM Members WHERE nickname == '${args[0]}' COLLATE NOCASE OR lastname_roma == '${args[0]}' COLLATE NOCASE OR firstname_roma == '${args[0]}' COLLATE NOCASE`;
			sqlSelect = `SELECT id, name_kanji, lastname_roma, firstname_roma, nickname, birthdate, team1, team2, debuted, gen, member_id, twitter, instagram FROM Members, Socials WHERE (Members.id == Socials.member_id AND nickname == '${args[0]}' COLLATE NOCASE) OR (Members.id == Socials.member_id AND lastname_roma == '${args[0]}' COLLATE NOCASE) OR (Members.id == Socials.member_id AND firstname_roma == '${args[0]}' COLLATE NOCASE)`;
		}
		// Search for last name and first name if there are more than 1 argument (3rd, 4th, ... arguments are ignored).
		else {
			console.log('Searching for lastname: '+args[0]+', firstname: '+args[1]+'...');
			sqlCount = `SELECT COUNT(*) AS namesCount FROM Members WHERE lastname_roma == '${args[0]}' COLLATE NOCASE AND firstname_roma == '${args[1]}' COLLATE NOCASE`;
			sqlSelect = `SELECT id, name_kanji, lastname_roma, firstname_roma, nickname, birthdate, team1, team2, debuted, gen, member_id, twitter, instagram FROM Members, Socials WHERE Members.id == Socials.member_id AND lastname_roma == '${args[0]}' COLLATE NOCASE AND firstname_roma == '${args[1]}' COLLATE NOCASE`;
		}
		
		// Open database connection.
		let db = new sqlite3.Database('./akb.db', sqlite3.OPEN_READONLY, (err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Connected to the SQLite DB.');
		});
		
		// Database query.
		db.all(sqlCount, [], (err, rows) => {
			if (err) {
				throw err;
			}
			result = parseInt(rows[0].namesCount, 10);	// Count results.
			console.log(result.toString() + ' result(s) found.');
			
			// Return a rich embed if there's only one result.
			if (result == 1){
				db.all(sqlSelect, [], (err, rows) => {
					if (err) {
						throw err;
					}
					rows.forEach((row) => {
						rid = row.id;
						rkanji = row.name_kanji;
						rlastname = row.lastname_roma;
						rfirstname = row.firstname_roma;
						rnick = row.nickname;
						rbdate = row.birthdate;
						rteam1 = row.team1;
						rteam2 = row.team2;
						rdebuted = row.debuted;
						rgen = row.gen;
						rtwitter = row.twitter;
						rig = row.instagram;
					});
				
					// Set variables.
					rgogo = rlastname+"-"+rfirstname;		// 7gogo URL is '<lastname>-<firstname>'.
					rsr = "48_"+rfirstname+"_"+rlastname;	// SR URL is '48_<firstname>_<lastname>'.
					rsr = rsr.toUpperCase();				// SR URL is uppercase.
					date1 = new Date();						// Current date.
					date2 = new Date(rbdate);				// Convert birthdate into Date type.
					age = Math.floor((date1-date2)/3.15e10);
					ykyspecial = '';						// Special disambiguation variable for Yokoyama Yui.

					// Team 8 members aren't part of any gen.
					// TODO: set in db.
					if (rgen == null){rgen = 'T8'}
					// Not all members are in 2 teams.
					if (rteam2 == null){rteam2 = ''}
					// Set group 1 and embed color according to team 1.
					if (rteam1 == 'S' || rteam1 == 'KII' || rteam1 == 'E'){rgroup1 = 'SKE48'; rcolor = 16233728;}
					// TODO: color.
					else if (rteam1 == 'N' || rteam1 == 'M' || rteam1 == 'BII'){rgroup1 = 'NMB48'}
					// TODO: color.
					else if (rteam1 == 'H' || rteam1 == 'KIV' || rteam1 == 'TII'){rgroup1 = 'HKT48'}
					else {rgroup1 = 'AKB48'; rcolor = 15700656;}
					// Set group 2 according to team 2.
					if (rteam2 == 'S' || rteam2 == 'KII' || rteam2 == 'E'){rgroup2 = ' (SKE48)'}
					else if (rteam2 == 'N' || rteam2 == 'M' || rteam2 == 'BII'){rgroup2 = ' (NMB48)'}
					else if (rteam2 == 'H' || rteam2 == 'KIV' || rteam2 == 'TII'){rgroup2 = ' (HKT48)'}
					else if (rteam2 == ''){rgroup2 = ''}
					else {rgroup2 = ' (AKB48)'}
					// Set disambiguation variables for Yokoyama Yui (id 1 and 17).
					if (rid == '1'){ykyspecial = '_(Team_8)'; rsr = rsr+'_8';}
					else if(rid == '17'){rsr = rsr+'_A'}

					// Rich embed.
					const exampleEmbed = new Discord.RichEmbed()
						.attachFiles(['./files/'+rid+'.jpg'])
						.setColor(rcolor)
						.setTitle(rkanji)
						.setURL("http://stage48.net/wiki/index.php/"+rlastname+"_"+rfirstname+ykyspecial)
						.setThumbnail('attachment://'+rid+'.jpg')
						.addField('Name', rlastname+"\n"+rfirstname, true)
						.addField('Birthdate', rbdate+"\n"+age+" years old", true)
						.addField('Team', rteam1+" ("+rgroup1+")\n"+rteam2+rgroup2, true)
						.addField('Debut', rdebuted+"\nGen "+rgen, true)
						.addField('SNS', "[Twitter](https://twitter.com/"+rtwitter+")	           [7gogo](https://7gogo.jp/"+rgogo+")\n[Instagram](https://instagram.com/"+rig+")	    [Showroom](https://showroom-live.com/"+rsr+")", true)
						.setFooter("ykypedia #"+rid);
					
					// Send message.
					message.channel.send(exampleEmbed);

					// Close database connection.
					db.close((err) => {
						if (err) {
							return console.error(err.message);
						}
						console.log('Database connection closed.');
					});
				});
			}

			// Return a message asking for user to filter results if there are more than one.
			else if (result > 1){
				var msgconc = "";		// Concatenated string of individual results.
				var emojcpt = 1;		// Used to set the number emoji (number emoji is <number>+'️⃣'.
				var emojlist = [];		// Array of emojis.
				var emojlist2 = [];		// Array of emojlist indexes (1st emoji index is 0, 2nd is 3, 3rd is 6, ...)
				var emojlist2cpt = 0;	// Count number of emojis.
				var msgconccpt = 1;		// Adds numbers to list of multiple results.
				var is_deleted = false;	// Check if message was deleted by reactions.
				
				// Database query.
				db.all(sqlSelect, [], (err, rows) => {
					if (err) {
						throw err;
					}
					rows.forEach((row) => {
						rlastname = row.lastname_roma;
						rfirstname = row.firstname_roma;
						rnick = row.nickname;
						rbdate = row.birthdate;
						msgconc = msgconc + msgconccpt + ' - ' + rlastname + ' ' + rfirstname + ' (' + rnick + ', ' + rbdate + ')\n';
						msgconccpt++;
					});
					
					// Send message, then add one emoji for each result.
					message.channel.send('Found '+result+' results, use reactions to select:\n'+msgconc)
						.then(async message => {
							while (emojcpt <= result){
								try {
									await message.react(emojcpt+'️⃣');	// Add reaction to message.
									emojlist = emojlist + (emojcpt+'️⃣');	// Append emojlist array.
									emojlist2.push(emojlist2cpt);		// emojlist2 will be [0, 3, 6, ...].
									emojcpt++;
									emojlist2cpt = emojlist2cpt + 3;
								}
								catch (error) {
									console.error("Emoji failed.");
								}
							}
							// Delete message after 10 secs if there was no reaction.
							setTimeout(function(){
								if (is_deleted == false){
									message.delete().catch(error => console.error("Error when deleting.", error));
								}
							}, 10000);
							// Get and listen to reactions on the message.
							const filter = (reaction) => {
								return emojlist.includes(reaction.emoji.name);
							};
							const collector = message.createReactionCollector(filter);
							collector.on('collect', r => {
								// If there's 2 or more votes for one reaction (reactions have 1 vote by default).
								if(r.count >= 2){
									// Send '!search <lastname firstname>' message.
									try {
										r.message.delete();	// Delete message so users can't vote anymore.
										is_deleted = true;
										if (rows[emojlist2.indexOf(emojlist.indexOf(r.emoji.name))].lastname_roma == 'Yokoyama' &&
											rows[emojlist2.indexOf(emojlist.indexOf(r.emoji.name))].firstname_roma == 'Yui')
											{
												message.channel.send('!search ' + 
												rows[emojlist2.indexOf(emojlist.indexOf(r.emoji.name))].nickname)
												.then(async message => {
													message.delete();
												});
											}
										else
										{
											message.channel.send('!search ' + 
											rows[emojlist2.indexOf(emojlist.indexOf(r.emoji.name))].lastname_roma +
											' ' + rows[emojlist2.indexOf(emojlist.indexOf(r.emoji.name))].firstname_roma)
											.then(async message => {
												message.delete();
											});
										}
									}
									catch (error) {
										console.error("Message couldn't be sent.");
									}
								}
							})
						});
				});
				// Close database connection.
				db.close((err) => {
					if (err) {
						return console.error(err.message);
					}
					console.log('Database connection closed.');
				});
			}
			
			// Return a message if there's no result.
			else if (result == 0){
				message.channel.send('No result found.');
				// Close database connection.
				db.close((err) => {
					if (err) {
						return console.error(err.message);
					}
					console.log('Database connection closed.');
				});
			}
		});
	}
}