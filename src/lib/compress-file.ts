import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

// Chuyển pipeline thành Promise để xử lý bất đồng bộ
const pipelineAsync = promisify(pipeline);

export async function compressFile(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Tạo stream đọc file TXT
    const readStream = createReadStream(inputPath);
    // Tạo stream nén gzip
    const gzip = createGzip();
    // Tạo stream ghi file nén
    const writeStream = createWriteStream(outputPath);

    // Kết nối các stream: đọc -> nén -> ghi
    await pipelineAsync(readStream, gzip, writeStream);
    console.log(`File ${inputPath} đã được nén thành ${outputPath}`);
  } catch (err) {
    console.error('Lỗi khi nén file:', err);
    throw err;
  }
}