import dotenv from 'dotenv';
dotenv.config();
import ImageKit from '@imagekit/nodejs';
import { Readable } from 'stream';

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadFile = async (buffer, fileName) => {
  try {
    const stream = Readable.from(buffer);
    
    const result = await client.files.upload({
      file: stream,
      fileName: fileName,
    });

    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload file');
  }
};

export default client;
