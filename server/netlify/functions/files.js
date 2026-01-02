import mongoose from 'mongoose';

export async function handler(event, context) {
  const { filename } = event.pathParameters;

  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberpunk-app');
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    const downloadStream = bucket.openDownloadStreamByName(filename);

    return new Promise((resolve, reject) => {
      const chunks = [];
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'image/jpeg', // Adjust based on file type
            'Cache-Control': 'public, max-age=31536000',
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true,
        });
      });

      downloadStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        resolve({
          statusCode: 404,
          body: JSON.stringify({ message: 'File not found' }),
        });
      });
    });
  } catch (error) {
    console.error('Error in files handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
