import * as fs from 'fs';
import * as zlib from 'zlib';
import { join } from 'path';

const filePath = join(__dirname, './countries.json.gz');

export const readCompressedJsonFile = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
    let json = '';

    stream.on('data', (chunk) => {
      json += chunk.toString(); // Collect decompressed chunks
    });

    stream.on('end', () => {
      try {
        const data = JSON.parse(json); // Parse decompressed JSON
        // console.log(data)
        resolve(data); // Resolve the Promise with the parsed data
      } catch (error ) {
        reject(new Error('Error parsing JSON: ' + error));
      }
    });

    stream.on('error', (err) => {
      reject(new Error('Error reading or decompressing file: ' + err.message));
    });
  });
};


