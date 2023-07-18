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

const commandMap:{ [key: string]: Function } = {
  '/카페': cafeCommand,
  '/구인글': googleFormCommand
}

function isPluginCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  return Object.keys(commandMap).some(x => x.startsWith(commands[0]));
}

function processPluginCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  if (isPluginCommand(msg)) {
    (commandMap[commands[0]])(msg);
  } else {
    msg.reply('알 수 없는 명령어입니다.\n - /명령어');
  }
}

exports.isPluginCommand = isPluginCommand;
exports.processPluginCommand = processPluginCommand;