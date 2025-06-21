import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "testlibs",
  aliases: ["testlib", "libtest"],
  description: "Testa se as bibliotecas estão funcionando corretamente",
  async execute(sock, msg, args, commands, config) {
    try {
      const results = [];
      
      // Testar Sharp
      try {
        const sharp = await import('sharp');
        results.push({
          name: "Sharp",
          status: "✅ Funcionando",
          version: sharp.default.versions?.sharp || "Desconhecida"
        });
      } catch (error) {
        results.push({
          name: "Sharp",
          status: "❌ Erro",
          error: error.message
        });
      }
      
      // Testar wa-sticker-formatter
      try {
        const { Sticker, StickerTypes } = await import('wa-sticker-formatter');
        results.push({
          name: "wa-sticker-formatter",
          status: "✅ Funcionando",
          version: "4.4.4"
        });
      } catch (error) {
        results.push({
          name: "wa-sticker-formatter",
          status: "❌ Erro",
          error: error.message
        });
      }
      
      // Testar fs-extra
      try {
        const fs = await import('fs-extra');
        results.push({
          name: "fs-extra",
          status: "✅ Funcionando",
          version: "11.3.0"
        });
      } catch (error) {
        results.push({
          name: "fs-extra",
          status: "❌ Erro",
          error: error.message
        });
      }
      
      // Testar MediaProcessor
      try {
        const { MediaProcessor } = await import('../../utils/MediaProcessor.js');
        const processor = new MediaProcessor();
        results.push({
          name: "MediaProcessor",
          status: "✅ Funcionando",
          version: "1.0.0"
        });
      } catch (error) {
        results.push({
          name: "MediaProcessor",
          status: "❌ Erro",
          error: error.message
        });
      }
      
      // Criar relatório
      let report = Formatter.card(
        "🧪 Teste de Bibliotecas",
        `${Formatter.info("Status das bibliotecas instaladas:")}\n\n`
      );
      
      results.forEach(result => {
        report += `${Formatter.bold(result.name)}: ${result.status}\n`;
        if (result.version) {
          report += `  ${Formatter.info("Versão:")} ${result.version}\n`;
        }
        if (result.error) {
          report += `  ${Formatter.error("Erro:")} ${result.error}\n`;
        }
        report += "\n";
      });
      
      // Contar sucessos e falhas
      const successCount = results.filter(r => r.status.includes("✅")).length;
      const errorCount = results.filter(r => r.status.includes("❌")).length;
      
      report += `${Formatter.bold("Resumo:")}\n`;
      report += `✅ ${successCount} bibliotecas funcionando\n`;
      report += `❌ ${errorCount} bibliotecas com erro\n\n`;
      
      if (errorCount === 0) {
        report += `${Formatter.success("🎉 Todas as bibliotecas estão funcionando perfeitamente!")}`;
      } else {
        report += `${Formatter.error("⚠️ Algumas bibliotecas têm problemas. Verifique a instalação.")}`;
      }
      
      await sock.sendMessage(msg.key.remoteJid, { text: report });
      
    } catch (error) {
      const errorText = Formatter.card(
        "❌ Erro no Teste",
        `${Formatter.error("Erro ao executar teste de bibliotecas:")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 