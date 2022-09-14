# GuildBot

Written by @snailcookierun

© 2022 snailcookierun, all rights reserved.

## Development environment setup
- Install npm
- `npm install --save-dev typescript`
- `npm install --save-dev @types/node`

## Device setup
- Install '메신저봇R' in your phone.
- Create 'GuildBot'.

## How to run
- Move to Bots/GuildBot directory. `cd Bots/GuildBot`
- Change `config-example.json` file and save as `config.json`.
- Compile scripts. `tsc`
- Copy `GuildBot.js` to `GuildBot` phone directory and overwrite the existing file.
- Copy `modules/main.js` to `GuildBot/modules` phone directory.
- Copy `config.json` to `GuildBot` phone directory.
- Press compile button (it looks like refresh button) in your 메신저봇R.
- Run GuildBot.

## FAQ
- If you want to change your bot name, you must change `scriptName` in `config.ts`.
- `tsc` authorization error in Windows: type `Set-ExecutionPolicy RemoteSigned`
