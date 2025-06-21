import dotenv from "dotenv";
import colors from "colors";

// Carregar variáveis de ambiente
dotenv.config();

console.log(colors.cyan("🔍 Verificando configurações do ambiente...\n"));

// Verificar configurações básicas
const configs = {
  "BOT_NAME": process.env.BOT_NAME,
  "BOT_PREFIX": process.env.BOT_PREFIX,
  "OWNER_NUMBER": process.env.OWNER_NUMBER,
  "SPIDERX_API_KEY": process.env.SPIDERX_API_KEY,
  "GEMINI_API_KEY": process.env.GEMINI_API_KEY
};

let hasIssues = false;

for (const [key, value] of Object.entries(configs)) {
  if (value) {
    if (key === "SPIDERX_API_KEY" || key === "GEMINI_API_KEY") {
      if (value === "SUA_CHAVE_AQUI" || value === "D0wgubPHthjiOv8DxshC") {
        console.log(colors.red(`❌ ${key}: ${value} (Chave padrão - precisa ser alterada)`));
        hasIssues = true;
      } else {
        console.log(colors.green(`✅ ${key}: ${value.substring(0, 10)}...`));
      }
    } else {
      console.log(colors.green(`✅ ${key}: ${value}`));
    }
  } else {
    console.log(colors.yellow(`⚠️  ${key}: Não definido (usando padrão)`));
  }
}

console.log("\n" + colors.cyan("📋 Resumo:"));

if (hasIssues) {
  console.log(colors.red("❌ Problemas encontrados:"));
  console.log(colors.red("   • As chaves das APIs precisam ser configuradas"));
  console.log(colors.red("   • Crie um arquivo .env na raiz do projeto"));
  console.log(colors.red("   • Obtenha suas chaves em: https://spiderx.com.br"));
} else {
  console.log(colors.green("✅ Todas as configurações estão corretas!"));
}

console.log(colors.cyan("\n🔧 Para configurar:"));
console.log("1. Crie um arquivo .env na raiz do projeto");
console.log("2. Copie o conteúdo do env.example");
console.log("3. Substitua as chaves das APIs pelas suas chaves reais");
console.log("4. Reinicie o bot"); 