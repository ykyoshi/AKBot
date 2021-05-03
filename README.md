# AKBot
Discord bot to browse through AKB48 members.

## Introduction
AKBot will return a RichEmbed containing information regarding any AKB member after searching for the member's name.

## Getting started
Download the project.
### Prerequisites
- Node.js (https://nodejs.org/),
- discord.js module (https://discord.js.org/),
- a valid sqlite3 database,
- a valid auth.json file.

## Usage
The default command prefix is '!'.
Use '!help' to get help regarding commands.
Use '!search {nickname|last name [first name]}' to search for a member.
If search query contains multiple results, AKBot will number them and add emojis that so users can select the correct result.
### Example
'!search jurina' will return Matsui Jurina. '!search matsui jurina' will return Matsui Jurina. '!search Yokochan' will return Team 8's Yokoyama Yui. '!search Yokoyama Yui' will return a numbered list where 1️⃣ is Team A's Yokoyama Yui and 2️⃣ is Team 8's Yokoyama Yui, selecting the 1️⃣ or 2️⃣ emoji will return the correct result.

## Author
**yky** - https://github.com/ykyoshi
