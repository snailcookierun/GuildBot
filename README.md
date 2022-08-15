# GuildBot

Written by @snailcookierun

© 2022 snailcookierun, all rights reserved.

## Development environment setup
- Install npm
- `npm install --save-dev typescript`
- `npm install --save-dev @types/node`

## Device setup
- Install '메신저봇R' in your phone
- Create 'GuildBot'

## How to compile
- Move to Bots/GuildBot directory `cd Bots/GuildBot`
- Compile main.ts `tsc main.ts --outDir modules`
- Copy `GuildBot.js` to `GuildBot` directory and overwrite the existing file
- Copy `modules/main.js` to `GuildBot/modules` directory

## FAQ
- `tsc` authorization error in Windows: type `Set-ExecutionPolicy RemoteSigned`
