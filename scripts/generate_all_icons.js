const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const srcJpg = 'C:/Users/nuurd/.gemini/antigravity-ide/brain/a4bd300d-d65c-4e88-b58a-4dd3b820460b/.user_uploaded/media_1791687668571.jpg';

async function generate() {
  console.log('Generating DukaamiOnline brand assets...');

  // 1. Load full logo
  const fullLogoBuf = await sharp(srcJpg).png().toBuffer();

  // 2. Extract DO Emblem (rows 181 to 624, cols 121 to 957)
  const emblemRaw = await sharp(srcJpg)
    .extract({ left: 115, top: 180, width: 850, height: 450 })
    .toBuffer();

  // Place emblem nicely centered in a 1024x1024 canvas with 12% padding
  const resizedEmblem = await sharp(emblemRaw)
    .resize(800, null, { fit: 'inside' })
    .toBuffer();
  
  const emblemMeta = await sharp(resizedEmblem).metadata();
  const left = Math.round((1024 - emblemMeta.width) / 2);
  const top = Math.round((1024 - emblemMeta.height) / 2);

  const emblem1024Buf = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: resizedEmblem, left, top }])
  .png()
  .toBuffer();

  // Helper to ensure dir and write resized PNG
  async function saveResizedPng(buffer, targetPath, width, height) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    await sharp(buffer)
      .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(targetPath);
    console.log(`Saved: ${targetPath} (${width}x${height})`);
  }

  // Helper for ICO file
  async function saveIco(buffer, targetPath, size = 32) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    const pngBuf = await sharp(buffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    const icoHeader = Buffer.alloc(22);
    icoHeader.writeUInt16LE(0, 0); // reserved
    icoHeader.writeUInt16LE(1, 2); // type 1 = icon
    icoHeader.writeUInt16LE(1, 4); // count 1

    icoHeader.writeUInt8(size, 6); // width
    icoHeader.writeUInt8(size, 7); // height
    icoHeader.writeUInt8(0, 8); // color count
    icoHeader.writeUInt8(0, 9); // reserved
    icoHeader.writeUInt16LE(1, 10); // color planes
    icoHeader.writeUInt16LE(32, 12); // bpp
    icoHeader.writeUInt32LE(pngBuf.length, 14); // image size
    icoHeader.writeUInt32LE(22, 18); // offset

    const icoBuf = Buffer.concat([icoHeader, pngBuf]);
    fs.writeFileSync(targetPath, icoBuf);
    console.log(`Saved ICO: ${targetPath}`);
  }

  // --- 1. apps/web/public ---
  const webPublic = path.join(rootDir, 'apps/web/public');
  await saveResizedPng(emblem1024Buf, path.join(webPublic, 'kaafi_logo.png'), 1024, 1024);
  await saveResizedPng(emblem1024Buf, path.join(webPublic, 'kaafi_logo_512.png'), 512, 512);
  await saveResizedPng(emblem1024Buf, path.join(webPublic, 'dukaami_icon.png'), 1024, 1024);
  await saveResizedPng(fullLogoBuf, path.join(webPublic, 'dukaami_logo.png'), 1024, 1024);
  await saveResizedPng(emblem1024Buf, path.join(webPublic, 'favicon.png'), 64, 64);
  await saveIco(emblem1024Buf, path.join(webPublic, 'favicon.ico'), 32);

  const webIcons = path.join(webPublic, 'icons');
  await saveResizedPng(emblem1024Buf, path.join(webIcons, 'icon-192.png'), 192, 192);
  await saveResizedPng(emblem1024Buf, path.join(webIcons, 'icon-512.png'), 512, 512);
  await sharp(fullLogoBuf).jpeg({ quality: 95 }).toFile(path.join(webIcons, 'icon-source.jpg'));

  // Next.js app icon
  const webAppIcon = path.join(rootDir, 'apps/web/src/app/icon.png');
  await saveResizedPng(emblem1024Buf, webAppIcon, 512, 512);

  // --- 2. apps/mobile/assets/images ---
  const mobileAssets = path.join(rootDir, 'apps/mobile/assets/images');
  await saveResizedPng(emblem1024Buf, path.join(mobileAssets, 'kaafi_logo.png'), 1024, 1024);
  await saveResizedPng(emblem1024Buf, path.join(mobileAssets, 'kaafi_logo_128.png'), 128, 128);
  await saveResizedPng(emblem1024Buf, path.join(mobileAssets, 'kaafi_logo_512.png'), 512, 512);
  await saveResizedPng(emblem1024Buf, path.join(mobileAssets, 'dukaami_icon.png'), 1024, 1024);
  await saveResizedPng(fullLogoBuf, path.join(mobileAssets, 'dukaami_logo.png'), 1024, 1024);

  // --- 3. apps/mobile/android/app/src/main/res ---
  const mobileRes = path.join(rootDir, 'apps/mobile/android/app/src/main/res');
  await saveResizedPng(emblem1024Buf, path.join(mobileRes, 'mipmap-mdpi/ic_launcher.png'), 48, 48);
  await saveResizedPng(emblem1024Buf, path.join(mobileRes, 'mipmap-hdpi/ic_launcher.png'), 72, 72);
  await saveResizedPng(emblem1024Buf, path.join(mobileRes, 'mipmap-xhdpi/ic_launcher.png'), 96, 96);
  await saveResizedPng(emblem1024Buf, path.join(mobileRes, 'mipmap-xxhdpi/ic_launcher.png'), 144, 144);
  await saveResizedPng(emblem1024Buf, path.join(mobileRes, 'mipmap-xxxhdpi/ic_launcher.png'), 192, 192);

  // --- 4. apps/mobile/ios/Runner/Assets.xcassets/AppIcon.appiconset ---
  const iosAppIcon = path.join(rootDir, 'apps/mobile/ios/Runner/Assets.xcassets/AppIcon.appiconset');
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-1024x1024@1x.png'), 1024, 1024);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-20x20@1x.png'), 20, 20);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-20x20@2x.png'), 40, 40);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-20x20@3x.png'), 60, 60);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-29x29@1x.png'), 29, 29);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-29x29@2x.png'), 58, 58);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-29x29@3x.png'), 87, 87);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-40x40@1x.png'), 40, 40);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-40x40@2x.png'), 80, 80);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-40x40@3x.png'), 120, 120);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-60x60@2x.png'), 120, 120);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-60x60@3x.png'), 180, 180);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-76x76@1x.png'), 76, 76);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-76x76@2x.png'), 152, 152);
  await saveResizedPng(emblem1024Buf, path.join(iosAppIcon, 'Icon-App-83.5x83.5@2x.png'), 167, 167);

  // iOS LaunchImage
  const iosLaunch = path.join(rootDir, 'apps/mobile/ios/Runner/Assets.xcassets/LaunchImage.imageset');
  if (fs.existsSync(iosLaunch)) {
    await saveResizedPng(emblem1024Buf, path.join(iosLaunch, 'LaunchImage.png'), 1024, 1024);
    await saveResizedPng(emblem1024Buf, path.join(iosLaunch, 'LaunchImage@2x.png'), 1024, 1024);
    await saveResizedPng(emblem1024Buf, path.join(iosLaunch, 'LaunchImage@3x.png'), 1024, 1024);
  }

  // --- 5. apps/mobile/web ---
  const mobileWeb = path.join(rootDir, 'apps/mobile/web');
  await saveResizedPng(emblem1024Buf, path.join(mobileWeb, 'favicon.png'), 64, 64);
  await saveResizedPng(emblem1024Buf, path.join(mobileWeb, 'icons/Icon-192.png'), 192, 192);
  await saveResizedPng(emblem1024Buf, path.join(mobileWeb, 'icons/Icon-512.png'), 512, 512);
  await saveResizedPng(emblem1024Buf, path.join(mobileWeb, 'icons/Icon-maskable-192.png'), 192, 192);
  await saveResizedPng(emblem1024Buf, path.join(mobileWeb, 'icons/Icon-maskable-512.png'), 512, 512);

  // --- 6. apps/web/android/app/src/main/res (Capacitor) ---
  const capAndroidRes = path.join(rootDir, 'apps/web/android/app/src/main/res');
  if (fs.existsSync(capAndroidRes)) {
    const densities = [
      { dir: 'mipmap-mdpi', launcher: 48, round: 48, fg: 108 },
      { dir: 'mipmap-hdpi', launcher: 72, round: 72, fg: 162 },
      { dir: 'mipmap-xhdpi', launcher: 96, round: 96, fg: 216 },
      { dir: 'mipmap-xxhdpi', launcher: 144, round: 144, fg: 324 },
      { dir: 'mipmap-xxxhdpi', launcher: 192, round: 192, fg: 432 }
    ];

    for (const d of densities) {
      const targetDir = path.join(capAndroidRes, d.dir);
      if (fs.existsSync(targetDir)) {
        await saveResizedPng(emblem1024Buf, path.join(targetDir, 'ic_launcher.png'), d.launcher, d.launcher);
        await saveResizedPng(emblem1024Buf, path.join(targetDir, 'ic_launcher_round.png'), d.round, d.round);
        await saveResizedPng(emblem1024Buf, path.join(targetDir, 'ic_launcher_foreground.png'), d.fg, d.fg);
      }
    }
  }

  // --- 7. apps/web/ios/App/App/Assets.xcassets (Capacitor) ---
  const capIosAppIcon = path.join(rootDir, 'apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset');
  if (fs.existsSync(capIosAppIcon)) {
    await saveResizedPng(emblem1024Buf, path.join(capIosAppIcon, 'AppIcon-512@2x.png'), 1024, 1024);
  }

  console.log('✅ All icons and logos generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
