import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sessionPath = path.join(__dirname, "..", "sessions");

function clearSession() {
  try {
    if (fs.existsSync(sessionPath)) {
      const files = fs.readdirSync(sessionPath);

      if (files.length === 0) {
        console.log("✅ Nenhuma sessão encontrada para limpar.");
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(sessionPath, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removido: ${file}`);
      });

      console.log("✅ Sessões limpas com sucesso!");
    } else {
      console.log("✅ Pasta de sessões não existe.");
    }
  } catch (error) {
    console.error("❌ Erro ao limpar sessões:", error.message);
  }
}

clearSession();
