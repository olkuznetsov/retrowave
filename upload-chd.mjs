import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { createReadStream, statSync } from 'fs';

process.loadEnvFile();  // R2 credentials from gitignored .env (Node 20.12+); run from repo root
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY;
const SECRET_KEY = process.env.R2_SECRET_KEY;
const BUCKET = 'retrowave-roms';
const LOCAL_FILE = '/tmp/spyro-the-dragon.chd';
const KEY = 'roms/ps1/spyro-the-dragon.chd';
const PART_SIZE = 50 * 1024 * 1024; // 50MB parts

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const fileSize = statSync(LOCAL_FILE).size;
console.log(`Uploading ${LOCAL_FILE} (${(fileSize / 1024 / 1024).toFixed(1)} MB) as ${KEY}`);

const { UploadId } = await client.send(new CreateMultipartUploadCommand({
  Bucket: BUCKET, Key: KEY, ContentType: 'application/octet-stream',
}));

const parts = [];
let partNumber = 1;
let offset = 0;

while (offset < fileSize) {
  const length = Math.min(PART_SIZE, fileSize - offset);
  const stream = createReadStream(LOCAL_FILE, { start: offset, end: offset + length - 1 });
  const buf = await new Promise((res, rej) => {
    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end', () => res(Buffer.concat(chunks)));
    stream.on('error', rej);
  });
  const { ETag } = await client.send(new UploadPartCommand({
    Bucket: BUCKET, Key: KEY, UploadId, PartNumber: partNumber, Body: buf,
  }));
  parts.push({ PartNumber: partNumber, ETag });
  console.log(`  Part ${partNumber} uploaded (${(offset / 1024 / 1024).toFixed(0)}–${((offset + length) / 1024 / 1024).toFixed(0)} MB)`);
  offset += length;
  partNumber++;
}

await client.send(new CompleteMultipartUploadCommand({
  Bucket: BUCKET, Key: KEY, UploadId,
  MultipartUpload: { Parts: parts },
}));

console.log(`\nDone! spyro-the-dragon.chd uploaded to R2.`);
console.log(`URL: https://pub-44598954bf774754af38263b7890873b.r2.dev/${KEY}`);
