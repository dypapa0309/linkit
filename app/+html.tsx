import React, { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const publicBaseUrl = (process.env.EXPO_PUBLIC_PUBLIC_BASE_URL || 'https://linkit-link.netlify.app').replace(/\/$/, '');
const shareImageUrl = `${publicBaseUrl}/linkit-share.png`;
const faviconUrl = `${publicBaseUrl}/favicon.png`;

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Linkit</title>
        <meta
          name="description"
          content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Linkit" />
        <meta property="og:title" content="Linkit" />
        <meta
          property="og:description"
          content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요."
        />
        <meta property="og:image" content={shareImageUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Linkit" />
        <meta
          name="twitter:description"
          content="내 소개와 링크를 한 장으로 공유하는 Linkit 프로필 페이지예요."
        />
        <meta name="twitter:image" content={shareImageUrl} />
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={shareImageUrl} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
