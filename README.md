# GuildBot

Written by @snailcookierun

© 2022-present snailcookierun, all rights reserved.

## Development environment setup
- Install npm
- `npm install --save-dev typescript`
- `npm install --save-dev @types/node`

## Device setup
1. Install '메신저봇R' in your phone.
2. Create 'GuildBot'.

## How to run GuildBot on 메신저봇R
1. Move to common directory. `cd common`
2. Edit `config-example.json` file and save as `config.json`.
3. Move to msgbot directory. `cd ../msgbot`
4. type `tsc`.
5. Copy `GuildBot.js` to `GuildBot` phone directory and overwrite the existing file.
6. Copy `modules/main.js` to `GuildBot/modules` phone directory.
7. Copy `../common/config.json` to `GuildBot` phone directory.
8. Press compile button (it looks like refresh button) in your 메신저봇R.
9. Run GuildBot.

## FAQ
- If you want to change your bot name (GuildBot -> different name), you must change `scriptName` in `common/config.ts`.
- `tsc` authorization error in Windows: type `Set-ExecutionPolicy RemoteSigned`
