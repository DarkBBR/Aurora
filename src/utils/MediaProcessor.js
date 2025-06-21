import sharp from "sharp";
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fs from 'fs-extra';
import path from 'path';

export class MediaProcessor {
  constructor() {
    this.isInitialized = false;
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.ensureDir(this.tempDir);
    } catch (error) {
      console.error('Erro ao criar diretório temporário:', error);
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Testar se o sharp está funcionando com um buffer válido
      const testBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
      await sharp(testBuffer).metadata();
      this.isInitialized = true;
      console.log("MediaProcessor inicializado com sucesso!");
    } catch (error) {
      console.error("Erro ao inicializar MediaProcessor:", error);
      // Não lançar erro, apenas marcar como não inicializado
      this.isInitialized = false;
    }
  }

  // Função para validar se o buffer é uma imagem válida
  validateImageBuffer(buffer) {
    if (!buffer || buffer.length < 8) {
      return { isValid: false, error: "Buffer muito pequeno ou vazio" };
    }

    const header = buffer.slice(0, 8).toString("hex").toLowerCase();
    
    // Verificar headers de diferentes formatos
    const validHeaders = {
      "ffd8ff": "jpeg",
      "89504e470d0a1a0a": "png",
      "474946383761": "gif",
      "474946383961": "gif",
      "52494646": "webp",
      "00000100": "ico",
      "00000200": "ico"
    };

    for (const [headerStart, format] of Object.entries(validHeaders)) {
      if (header.startsWith(headerStart)) {
        return { isValid: true, format };
      }
    }

    // Se não reconhecer o header, retornar como válido mas formato desconhecido
    return { isValid: true, format: "unknown" };
  }

  async processImage(buffer, options = {}) {
    try {
      const {
        width = 512,
        height = 512,
        quality = 80,
        format = 'webp'
      } = options;

      // Processar imagem com Sharp
      let processed = sharp(buffer, { failOnError: false })
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });

      // Aplicar formato
      if (format === 'webp') {
        processed = processed.webp({ quality });
      } else if (format === 'png') {
        processed = processed.png({ quality });
      } else if (format === 'jpeg' || format === 'jpg') {
        processed = processed.jpeg({ quality });
      }

      return await processed.toBuffer();
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
  }

  async processVideo(buffer, options = {}) {
    try {
      const {
        width = 512,
        height = 512,
        duration = 3,
        fps = 10,
        format = 'webp'
      } = options;

      // Para vídeos, vamos usar Sharp para extrair frames
      // e depois criar um GIF animado
      const tempFile = path.join(this.tempDir, `temp_video_${Date.now()}.mp4`);
      const outputFile = path.join(this.tempDir, `output_${Date.now()}.webp`);

      // Salvar buffer temporariamente
      await fs.writeFile(tempFile, buffer);

      // Usar FFmpeg se disponível, senão usar Sharp
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        // Tentar usar FFmpeg para converter vídeo
        await execAsync(`ffmpeg -i "${tempFile}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,fps=${fps}" -t ${duration} -c:v libwebp -quality ${options.quality || 80} "${outputFile}"`);

        const result = await fs.readFile(outputFile);
        
        // Limpar arquivos temporários
        await fs.remove(tempFile);
        await fs.remove(outputFile);

        return result;
      } catch (ffmpegError) {
        // Fallback: usar Sharp para extrair primeiro frame
        console.log('FFmpeg não disponível, usando Sharp como fallback');
        
        const firstFrame = await sharp(buffer, { pages: -1 })
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: options.quality || 80 })
          .toBuffer();

        // Limpar arquivo temporário
        await fs.remove(tempFile);

        return firstFrame;
      }
    } catch (error) {
      throw new Error(`Erro ao processar vídeo: ${error.message}`);
    }
  }

  async createSticker(buffer, options = {}) {
    try {
      const {
        pack = 'Aurora Bot',
        author = 'Aurora',
        type = StickerTypes.FULL,
        categories = ['🤖'],
        quality = 70,
        background = 'transparent'
      } = options;

      // Criar sticker usando wa-sticker-formatter
      const sticker = new Sticker(buffer, {
        pack,
        author,
        type,
        categories,
        quality,
        background
      });

      return await sticker.toBuffer();
    } catch (error) {
      throw new Error(`Erro ao criar sticker: ${error.message}`);
    }
  }

  async createAnimatedSticker(buffer, options = {}) {
    try {
      const {
        pack = 'Aurora Bot',
        author = 'Aurora',
        type = StickerTypes.FULL,
        categories = ['🤖'],
        quality = 70,
        background = 'transparent'
      } = options;

      // Criar sticker animado usando wa-sticker-formatter
      const sticker = new Sticker(buffer, {
        pack,
        author,
        type,
        categories,
        quality,
        background
      });

      return await sticker.toBuffer();
    } catch (error) {
      throw new Error(`Erro ao criar sticker animado: ${error.message}`);
    }
  }

  async getImageInfo(inputBuffer) {
    try {
      // Tentar inicializar se necessário
      await this.initialize();
      
      // Validar buffer básico
      if (!inputBuffer || inputBuffer.length < 100) {
        return null;
      }
      
      let metadata;
      
      try {
        metadata = await sharp(inputBuffer, { failOnError: false }).metadata();
      } catch (sharpError) {
        // Se falhar, tentar com failOnError: false
        console.warn("Erro ao obter metadata, tentando com configurações mais básicas:", sharpError.message);
        metadata = await sharp(inputBuffer, { 
          failOnError: false,
          limitInputPixels: false
        }).metadata();
      }
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: inputBuffer.length,
        isAnimated: metadata.pages > 1 || metadata.format === "gif",
      };
    } catch (error) {
      console.error("Erro ao obter informações da imagem:", error);
      return null;
    }
  }

  async validateImage(buffer) {
    try {
      const metadata = await sharp(buffer, { failOnError: false }).metadata();
      
      return {
        isValid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
        isAnimated: metadata.pages && metadata.pages > 1
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  async validateVideo(buffer) {
    try {
      // Tentar extrair metadados com Sharp
      const metadata = await sharp(buffer, { pages: -1 }).metadata();
      
      return {
        isValid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
        duration: metadata.duration || 0
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  async cleanup() {
    try {
      await fs.emptyDir(this.tempDir);
    } catch (error) {
      console.error('Erro ao limpar diretório temporário:', error);
    }
  }
}
