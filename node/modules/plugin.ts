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