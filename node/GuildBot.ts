import { Server } from '@remote-kakao/core';
const main = require('./modules/main');

const prefix = '/';
const prefix2 = ' /';
const server = new Server();

main.init();

server.on('message', async (msg) => {
  if(main.checkRoomName(msg.room) && (msg.content.startsWith(prefix) || msg.content.startsWith(prefix2)) && !main.checkSkipMsgs(msg.content)) {
    msg.reply(main.processCommand(msg.content));
  } else if (main.checkPublicRoomName(msg.room) && (msg.content.startsWith(prefix) || msg.content.startsWith(prefix2)) && !main.checkSkipMsgs(msg.content)) {
    msg.reply(main.processPublicCommand(msg.content));
  }

  /*
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(' ');
  const cmd = args.shift()?.slice(prefix.length);


  if (cmd === 'ping') {

    const timestamp = Date.now();
    await msg.reply('Pong!');
    msg.reply(`${Date.now() - timestamp}ms`);
  }
  */
});

server.start(3000);

function autoSave() {
  main.autoSave();
}

setInterval(autoSave, 600000);