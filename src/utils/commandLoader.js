import fs from "fs";
import path from "path";

export async function loadCommands() {
  const commands = {};
  const commandsDir = path.join(process.cwd(), "src", "commands");

  async function loadCommandsFromDir(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        await loadCommandsFromDir(itemPath);
      } else if (item.endsWith(".js")) {
        try {
          const commandModule = await import(`file://${itemPath}`);
          const command = commandModule.default;

          if (command?.name) {
            commands[command.name] = command;

            if (command.aliases?.length) {
              for (const alias of command.aliases) {
                commands[alias] = command;
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao carregar comando ${item}:`, error);
        }
      }
    }
  }

  await loadCommandsFromDir(commandsDir);
  console.log(`✅ ${Object.keys(commands).length} comandos carregados`);
  return commands;
}
