import { PUBLIC_MAIN10 } from '../data/public-main10.ja.js';

const MAIN10_ROUTES = Object.freeze({
  'what-is-astera': './product/what-is-astera/',
  'why-astera': './product/why-astera/',
  value: './product/market/',
  engine: './product/value/',
  process: './app/',
  usage: './pricing/',
  technology: './product/process/',
  integration: './product/technology/',
  evidence: './product/japanese-reading/',
  app: './product/integration/',
});

export const MAIN10_ITEMS = Object.freeze(
  PUBLIC_MAIN10.map((item) => Object.freeze({
    ...item,
    route: MAIN10_ROUTES[item.id],
  })),
);

export const SUPPORTERS_ITEM = Object.freeze({
  id: 'supporters',
  iconId: 'integration',
  title: '支援者・スポンサーのご紹介',
  lead: 'Asteraを支えてくださる皆さまへ、深く感謝いたします。',
  body: '皆さまのご支援が、挑戦を前へ進める力です。',
  route: './supporters/'
});

export const SITE_TEXT = Object.freeze({
  topCopyright: 'Copyright © 2026 Astera'
});
