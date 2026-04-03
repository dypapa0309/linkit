const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(distPath)) {
  process.exit(0);
}

const publicBaseUrl = (process.env.EXPO_PUBLIC_PUBLIC_BASE_URL || 'https://linkit-link.netlify.app').replace(/\/$/, '');
const shareImageUrl = `${publicBaseUrl}/linkit-share.png`;
const faviconUrl = `${publicBaseUrl}/favicon.png`;
const fontStyleBlock = `
    <style id="linkit-fonts">
      html, body, #root, input, textarea, button {
        font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Segoe UI", sans-serif;
      }
    </style>`;

const metaBlock = `
    <meta name="description" content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Linkit" />
    <meta property="og:title" content="Linkit" />
    <meta property="og:description" content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요." />
    <meta property="og:image" content="${shareImageUrl}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Linkit" />
    <meta name="twitter:description" content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요." />
    <meta name="twitter:image" content="${shareImageUrl}" />
    <link rel="icon" href="${faviconUrl}" />
    <link rel="apple-touch-icon" href="${shareImageUrl}" />`;

const html = fs.readFileSync(distPath, 'utf8');

let nextHtml = html.replace('<html lang="en">', '<html lang="ko">');

if (!nextHtml.includes('og:site_name')) {
  nextHtml = nextHtml.replace('</head>', `${metaBlock}\n  </head>`);
}

if (!nextHtml.includes('linkit-fonts')) {
  nextHtml = nextHtml.replace('</head>', `${fontStyleBlock}\n  </head>`);
}

fs.writeFileSync(distPath, nextHtml);
