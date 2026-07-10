import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { createReadStream, statSync, readFileSync } from 'fs';

process.loadEnvFile();  // R2 credentials from gitignored .env (Node 20.12+); run from repo root
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY;
const SECRET_KEY = process.env.R2_SECRET_KEY;
const BUCKET     = 'retrowave-roms';
const PART_SIZE  = 50 * 1024 * 1024; // 50 MB
const DOWNLOADS  = '/Users/oleksandrkuznetsov/Downloads/ps1';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// ── ROMs (multipart) ──────────────────────────────────────────────────────────
const ROMS = [
  { local: 'Gran Turismo (USA).chd',                        key: 'roms/ps1/gran-turismo.chd' },
  { local: 'Gran Turismo 2 (USA) (Arcade Mode).chd',        key: 'roms/ps1/gran-turismo-2-arcade.chd' },
  { local: 'Gran Turismo 2 (USA) (Simulation Mode).chd',    key: 'roms/ps1/gran-turismo-2-simulation.chd' },
  { local: 'Need for Speed III - Hot Pursuit (USA).chd',    key: 'roms/ps1/nfs3-hot-pursuit.chd' },
  { local: 'Need for Speed - High Stakes (USA).chd',        key: 'roms/ps1/nfs-high-stakes.chd' },
  { local: 'Need for Speed - Porsche Unleashed (USA).chd',  key: 'roms/ps1/nfs-porsche-unleashed.chd' },
];

// ── Covers (single PUT) ───────────────────────────────────────────────────────
const COVERS = [
  { local: 'gran-turismo.jpg',         key: 'covers/ps1/gran-turismo.jpg' },
  { local: 'gran-turismo-2.jpg',       key: 'covers/ps1/gran-turismo-2.jpg' },
  { local: 'nfs-3.jpg',               key: 'covers/ps1/nfs3-hot-pursuit.jpg' },
  { local: 'nfs-high-stakes.jpg',     key: 'covers/ps1/nfs-high-stakes.jpg' },
  { local: 'nfs-porshe-unleashed.jpg', key: 'covers/ps1/nfs-porsche-unleashed.jpg' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function uploadMultipart(localPath, key) {
  const fileSize = statSync(localPath).size;
  console.log(`\n📦 ${key}`);
  console.log(`   ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

  const { UploadId } = await client.send(new CreateMultipartUploadCommand({
    Bucket: BUCKET, Key: key, ContentType: 'application/octet-stream',
  }));

  const parts = [];
  let offset = 0, partNumber = 1;
  const total = Math.ceil(fileSize / PART_SIZE);

  try {
    while (offset < fileSize) {
      const length = Math.min(PART_SIZE, fileSize - offset);
      const buf = await streamToBuffer(createReadStream(localPath, { start: offset, end: offset + length - 1 }));
      const { ETag } = await client.send(new UploadPartCommand({
        Bucket: BUCKET, Key: key, UploadId, PartNumber: partNumber, Body: buf, ContentLength: buf.length,
      }));
      parts.push({ PartNumber: partNumber, ETag });
      process.stdout.write(`   Part ${partNumber}/${total} ✓\r`);
      offset += length;
      partNumber++;
    }
    await client.send(new CompleteMultipartUploadCommand({
      Bucket: BUCKET, Key: key, UploadId, MultipartUpload: { Parts: parts },
    }));
    console.log(`   ✅ Done`);
  } catch (err) {
    await client.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId }));
    throw err;
  }
}

async function uploadCover(localPath, key) {
  const body = readFileSync(localPath);
  await client.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: body, ContentType: 'image/jpeg',
  }));
  console.log(`   🖼  ${key} ✅`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('═══ RetroWave batch upload ═══\n');

console.log('── Covers ──');
for (const { local, key } of COVERS) {
  await uploadCover(`${DOWNLOADS}/${local}`, key);
}

console.log('\n── ROMs ──');
for (const { local, key } of ROMS) {
  await uploadMultipart(`${DOWNLOADS}/${local}`, key);
}

console.log('\n═══ All done! ═══');
