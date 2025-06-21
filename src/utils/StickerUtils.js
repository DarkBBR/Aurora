/**
 * Utilitários para criação de stickers
 */

// Função para permutar nomes de pack
export function permuteFigPackName(packNames) {
  const names = packNames.split('\n');
  return names[Math.floor(Math.random() * names.length)];
}

// Função para permutar nomes de author
export function permuteFigAuthorName(authorNames) {
  const names = authorNames.split('\n');
  return names[Math.floor(Math.random() * names.length)];
}

// Função para gerar pack name padrão
export function getDefaultPackName() {
  const packNames = [
    "❪👤𝚄𝚜𝚞á𝚛𝚒𝚘 (𝚊)ฺ࣭࣪͘ꕸ▸",
    "❪🤖𝙱𝚘𝚝ฺ࣭࣪͘ꕸ▸", 
    "❪👑𝙳𝚘𝚗𝚘ฺ࣭࣪͘ꕸ▸",
    "❪🌐𝚂𝚒𝚝𝚎ฺ࣭࣪͘ꕸ▸",
    "🎨 Aurora Stickers",
    "✨ Figurinhas Aurora",
    "🌟 Stickers Premium",
    "💫 Aurora Bot Pack"
  ];
  
  return permuteFigPackName(packNames.join('\n'));
}

// Função para gerar author name padrão
export function getDefaultAuthorName(pushName, botName, ownerName, siteUrl) {
  const authorNames = [
    pushName || "Usuário",
    botName || "Aurora Bot", 
    ownerName || "Aurora",
    siteUrl || "https://github.com"
  ];
  
  return permuteFigAuthorName(authorNames.join('\n'));
}

// Função para validar duração de vídeo
export function validateVideoDuration(seconds, maxSeconds = 10) {
  if (!seconds) return true;
  return seconds <= maxSeconds;
}

// Função para formatar duração
export function formatDuration(seconds) {
  if (!seconds) return "Desconhecida";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
}

// Função para detectar tipo de mídia
export function detectMediaType(msg) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  // Detectar imagem
  const hasImage = quotedMsg?.imageMessage || 
                  msg.message?.imageMessage || 
                  quotedMsg?.viewOnceMessageV2?.message?.imageMessage || 
                  msg.message?.viewOnceMessageV2?.message?.imageMessage || 
                  quotedMsg?.viewOnceMessage?.message?.imageMessage || 
                  msg.message?.viewOnceMessage?.message?.imageMessage;
  
  // Detectar vídeo
  const hasVideo = quotedMsg?.videoMessage || 
                  msg.message?.videoMessage || 
                  quotedMsg?.viewOnceMessageV2?.message?.videoMessage || 
                  msg.message?.viewOnceMessageV2?.message?.videoMessage || 
                  quotedMsg?.viewOnceMessage?.message?.videoMessage || 
                  msg.message?.viewOnceMessage?.message?.videoMessage;
  
  if (hasImage) {
    return { type: 'image', message: hasImage };
  } else if (hasVideo) {
    return { type: 'video', message: hasVideo };
  }
  
  return { type: null, message: null };
}

// Função para criar configurações de sticker
export function createStickerConfig(mediaType, mediaMessage, config) {
  const baseConfig = {
    width: 512,
    height: 512,
    quality: 80,
    format: 'webp'
  };
  
  if (mediaType === 'video') {
    return {
      ...baseConfig,
      duration: Math.min(mediaMessage.seconds || 3, 10),
      fps: 10
    };
  }
  
  return baseConfig;
} 