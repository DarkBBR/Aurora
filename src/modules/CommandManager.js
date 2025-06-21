import { join } from "path";
import { pathToFileURL } from "url";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CommandManager {
  constructor() {
    this.commands = {};
    this.aliases = {};
    this.commandsPath = join(__dirname, "..", "commands");
  }

  async loadCommands(logger) {
    try {
      await this.loadCommandsRecursive(this.commandsPath, logger);
      
      logger.info(`Total de comandos carregados: ${Object.keys(this.commands).length}`);
      logger.info(`Total de aliases carregados: ${Object.keys(this.aliases).length}`);
    } catch (error) {
      logger.error(`Erro ao carregar comandos: ${error.message}`);
    }
  }

  async loadCommandsRecursive(dirPath, logger) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Se é uma pasta, carrega recursivamente
          await this.loadCommandsRecursive(fullPath, logger);
        } else if (item.endsWith(".js")) {
          // Se é um arquivo .js, carrega o comando
          await this.loadCommandFile(fullPath, logger);
        }
      }
    } catch (error) {
      logger.error(`Erro ao carregar comandos de ${dirPath}: ${error.message}`);
    }
  }

  async loadCommandFile(filePath, logger) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const cmdModule = await import(fileUrl);
      const cmd = cmdModule.default;
      
      if (cmd && cmd.name) {
        this.commands[cmd.name] = cmd;
        logger.info(`Comando carregado: ${cmd.name} (${filePath})`);
        
        // Carregar aliases
        if (cmd.aliases && Array.isArray(cmd.aliases)) {
          for (const alias of cmd.aliases) {
            this.aliases[alias] = cmd.name;
            logger.info(`Alias carregado: ${alias} -> ${cmd.name}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Erro ao carregar comando ${filePath}: ${error.message}`);
    }
  }

  getCommand(name) {
    // Primeiro tenta encontrar o comando direto
    if (this.commands[name]) {
      return this.commands[name];
    }
    
    // Se não encontrar, procura nos aliases
    if (this.aliases[name]) {
      return this.commands[this.aliases[name]];
    }
    
    return null;
  }

  getAllCommands() {
    return this.commands;
  }

  getCommandsByCategory() {
    const categories = {};
    
    for (const [name, command] of Object.entries(this.commands)) {
      const category = this.getCommandCategory(name);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ name, command });
    }
    
    return categories;
  }

  getCommandCategory(commandName) {
    // Determina a categoria baseada no nome do comando ou sua localização
    const command = this.commands[commandName];
    if (!command) return 'unknown';
    
    // Você pode adicionar lógica aqui para determinar categorias baseadas em tags ou outros critérios
    return 'general';
  }

  async executeCommand(commandName, sock, msg, args, config) {
    const command = this.getCommand(commandName);
    
    if (!command) {
      return false;
    }

    try {
      await command.execute(sock, msg, args, this.commands, config);
      return true;
    } catch (error) {
      throw error;
    }
  }
} 