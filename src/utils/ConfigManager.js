import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, "..", "..", "config.json");
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    }

    // Configuração padrão
    return {
      autoSticker: false,
      autoStickerGroups: [],
      autoStickerUsers: []
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      return false;
    }
  }

  // Configurações de figurinha automática
  isAutoStickerEnabled() {
    return this.config.autoSticker;
  }

  setAutoSticker(enabled) {
    this.config.autoSticker = enabled;
    return this.saveConfig();
  }

  // Configurações por grupo/usuário
  isAutoStickerEnabledForChat(chatId) {
    if (this.config.autoSticker) {
      return true; // Se global está ativado
    }
    
    if (chatId.endsWith("@g.us")) {
      return this.config.autoStickerGroups.includes(chatId);
    } else {
      return this.config.autoStickerUsers.includes(chatId);
    }
  }

  enableAutoStickerForChat(chatId) {
    if (chatId.endsWith("@g.us")) {
      if (!this.config.autoStickerGroups.includes(chatId)) {
        this.config.autoStickerGroups.push(chatId);
      }
    } else {
      if (!this.config.autoStickerUsers.includes(chatId)) {
        this.config.autoStickerUsers.push(chatId);
      }
    }
    return this.saveConfig();
  }

  disableAutoStickerForChat(chatId) {
    if (chatId.endsWith("@g.us")) {
      this.config.autoStickerGroups = this.config.autoStickerGroups.filter(id => id !== chatId);
    } else {
      this.config.autoStickerUsers = this.config.autoStickerUsers.filter(id => id !== chatId);
    }
    return this.saveConfig();
  }

  // Obter status
  getAutoStickerStatus() {
    return {
      global: this.config.autoSticker,
      groups: this.config.autoStickerGroups,
      users: this.config.autoStickerUsers
    };
  }
} 