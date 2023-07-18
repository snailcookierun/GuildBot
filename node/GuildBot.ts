/*
Copyright [2023] [snailcookierun]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Server } from '@remote-kakao/core';
const main = require('./modules/main');

const prefix = '/';
const prefix2 = ' /';
const server = new Server();

main.init();

server.on('message', async (msg) => {
  if ((msg.content.startsWith(prefix) || msg.content.startsWith(prefix2)) && !main.checkSkipMsgs(msg.content)) {
    if (main.checkAdminRoomName(msg.room)) {
      if (main.isPluginCommand(msg)) {
        main.processPluginCommand(msg);
      } else {
        msg.reply(main.processCommand(msg.content));
      }
    } else if (main.checkRoomName(msg.room)) {
      msg.reply(main.processCommand(msg.content));
    } else if (main.checkPublicRoomName(msg.room)) {
      msg.reply(main.processPublicCommand(msg.content));
    }
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