import fs from 'fs';
import path from 'path';

// Função simples para copiar e renomear a imagem
function prepareImage() {
  try {
    const inputPath = path.resolve('src/assets/menu.jpg');
    const outputPath = path.resolve('src/assets/menu-800x600.jpg');
    
    console.log('🔄 Preparando imagem para o menu...');
    
    // Copiar a imagem atual
    fs.copyFileSync(inputPath, outputPath);
    
    console.log('✅ Imagem preparada com sucesso!');
    console.log('📁 Arquivo: menu-800x600.jpg');
    console.log('💡 Dica: Redimensione manualmente para 800x600px');
    console.log('📏 Dimensões recomendadas: 800x600px');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

prepareImage(); 