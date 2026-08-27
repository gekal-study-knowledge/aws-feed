'use client';

import * as React from 'react';
import { Box } from '@mui/material';

interface PostContentProps {
  contentHtml: string;
  newSince?: string;
  newCount?: number;
}

// "2026-04-24 07:36:02 JST" → "2026-04-24 07:36:02"
const normalizeTimestamp = (ts: string): string =>
  ts
    .replace(/\s+JST$/i, '')
    .trim()
    .slice(0, 19);

const createBadge = (doc: Document): HTMLSpanElement => {
  const badge = doc.createElement('span');
  badge.className = 'new-entry-badge';
  badge.textContent = 'NEW';
  Object.assign(badge.style, {
    display: 'inline-block',
    background: '#ff9900',
    color: '#232f3e',
    fontSize: '0.6em',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '10px',
    verticalAlign: 'middle',
    letterSpacing: '0.05em',
  });
  return badge;
};

// 前回訪問時点で既に取得済みだったエントリー用の「確認済み」マーカー。
// ページ単位の既読アイコン（VisitedIcon の CheckCircleIcon）と見た目を揃え、
// 緑のチェックマークアイコンで表示する。
const createConfirmedBadge = (doc: Document): HTMLSpanElement => {
  const badge = doc.createElement('span');
  badge.className = 'confirmed-entry-badge';
  badge.setAttribute('title', '確認済み');
  badge.setAttribute('aria-label', '確認済み');
  badge.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
  Object.assign(badge.style, {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#2e7d32',
    marginLeft: '10px',
    verticalAlign: 'middle',
  });
  return badge;
};

// h3 から対応する ul 内の Fetched 時刻を取得する
const getFetchedTime = (h3: Element): string | undefined => {
  let sibling = h3.nextElementSibling;
  while (
    sibling &&
    sibling.tagName !== 'UL' &&
    sibling.tagName !== 'H2' &&
    sibling.tagName !== 'H3'
  ) {
    sibling = sibling.nextElementSibling;
  }
  if (!sibling || sibling.tagName !== 'UL') return undefined;

  const fetchedLi = Array.from(sibling.querySelectorAll('li')).find((li) =>
    li.textContent?.includes('Fetched'),
  );
  const m = fetchedLi?.textContent?.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  return m?.[1];
};

// contentHtml に NEW / 確認済みバッジを埋め込んだ HTML 文字列を作って返す。
// DOM を直接 appendChild するのではなく文字列（＝ React が管理する props）を
// 作り直すことで、再レンダーのたびに同じ結果が確定的に再構築される。
// （旧実装は useEffect 内で containerRef に直接 appendChild していたため、
// スクロール等による再レンダーで dangerouslySetInnerHTML が再適用されると
// バッジだけが跡形もなく消えるという不具合があった）
const annotateContentHtml = (contentHtml: string, newSince?: string, newCount = 0): string => {
  const hasUpdate = newSince !== undefined || newCount > 0;
  if (!hasUpdate || typeof window === 'undefined') return contentHtml;

  const doc = new DOMParser().parseFromString(contentHtml, 'text/html');
  // フィード本文（.entry-summary）に含まれる h3 は記事側の見出しなので除外する。
  // 含めるとリリースノート本文の小見出しにまでバッジが付いてしまう。
  const h3s = Array.from(doc.querySelectorAll('h3')).filter((h3) => !h3.closest('.entry-summary'));

  if (newSince) {
    // タイムスタンプ比較：fetched が閾値（前回アクセス時刻）より後のエントリーを NEW、
    // 以前のエントリーは前回アクセス時に取得済みだったので「確認済み」としてマーク
    const threshold = normalizeTimestamp(newSince);
    h3s.forEach((h3) => {
      const fetchedTime = getFetchedTime(h3);
      if (!fetchedTime) return;
      h3.appendChild(fetchedTime > threshold ? createBadge(doc) : createConfirmedBadge(doc));
    });
  } else if (newCount > 0) {
    // フォールバック：fetched 降順で上位 newCount 件をマーク
    // （旧フォーマットの localStorage など lastUpdated が不明な場合）
    const entries = h3s
      .map((h3) => ({ h3, fetchedTime: getFetchedTime(h3) ?? '' }))
      .filter((e) => e.fetchedTime !== '');

    entries.sort((a, b) => (a.fetchedTime > b.fetchedTime ? -1 : 1));

    // 同秒取得の場合は同グループとして扱う
    if (entries.length > 0) {
      const cutoffTime = entries[Math.min(newCount, entries.length) - 1].fetchedTime;
      entries.forEach(({ h3, fetchedTime }) => {
        h3.appendChild(fetchedTime >= cutoffTime ? createBadge(doc) : createConfirmedBadge(doc));
      });
    }
  }

  return doc.body.innerHTML;
};

export default function PostContent({ contentHtml, newSince, newCount = 0 }: PostContentProps) {
  const annotatedHtml = React.useMemo(
    () => annotateContentHtml(contentHtml, newSince, newCount),
    [contentHtml, newSince, newCount],
  );

  return (
    <Box
      className="markdown-body"
      sx={{
        mt: 4,
        mb: 8,
        // 長い URL やコード片がビューポートを押し広げないようにする
        overflowWrap: 'anywhere',

        // --- ページ自身の構造（情報源見出し / エントリー見出し / メタ情報） ---
        // 直接の子だけを対象にする。フィード本文にも h2・h3 が含まれるため、
        // 子孫セレクタにすると本文の見出しが情報源見出しと同格に描画されてしまう。
        '& > h2': {
          mt: 6,
          mb: 3,
          color: 'primary.main',
          fontSize: { xs: '1.35rem', md: '1.875rem' },
          fontWeight: 700,
          borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            width: '8px',
            height: '1.5em',
            bgcolor: 'secondary.main',
            mr: 2,
            borderRadius: '4px',
            flexShrink: 0,
          },
        },
        '& > h3': {
          mt: 4,
          mb: 1,
          fontWeight: 700,
          fontSize: { xs: '1.1rem', md: '1.3rem' },
          lineHeight: 1.5,
        },
        // Link / Published / Fetched のメタ情報リスト
        '& > ul': {
          listStyle: 'none',
          m: 0,
          mb: 2,
          p: 0,
          fontSize: { xs: '0.8rem', md: '0.85rem' },
          color: 'text.secondary',
          '& li': { mb: 0.5, lineHeight: 1.6 },
        },
        '& > p': { mb: 2, lineHeight: 1.8 },

        // --- フィード本文 ---
        // 提供元の HTML をそのまま描画する領域。ページ側の見出し階層と混ざらないよう
        // 枠で囲い、内部の見出しは一段小さく・装飾なしに正規化する。
        '& .entry-summary': {
          display: 'block',
          mb: 4,
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          bgcolor: 'background.paper',
          fontSize: { xs: '0.9rem', md: '0.95rem' },
          // 折りたたみ時のつまみ
          '& > summary': {
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: { xs: '0.85rem', md: '0.9rem' },
            color: 'secondary.main',
            listStylePosition: 'outside',
            userSelect: 'none',
            py: 0.5,
          },
          '&[open] > summary': {
            mb: 1.5,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          // 本文中の見出しはすべて同じスケールに正規化する
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            mt: 2.5,
            mb: 1,
            fontWeight: 700,
            color: 'text.primary',
            border: 'none',
            display: 'block',
            lineHeight: 1.5,
            '&::before': { content: 'none' },
          },
          '& h1, & h2': { fontSize: { xs: '1rem', md: '1.05rem' } },
          '& h3, & h4, & h5, & h6': { fontSize: { xs: '0.92rem', md: '0.97rem' } },
          '& p': { my: 1.5, lineHeight: 1.8 },
          '& ul, & ol': { my: 1.5, pl: 3 },
          '& li': { mb: 0.5, lineHeight: 1.7 },
          '& img': { maxWidth: '100%', height: 'auto', borderRadius: '8px', my: 2 },
          // 表は横に伸びやすいので、要素内でスクロールさせページを押し広げない
          '& table': {
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderCollapse: 'collapse',
            whiteSpace: 'normal',
            fontSize: { xs: '0.8rem', md: '0.85rem' },
            my: 2,
          },
          '& th, & td': {
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            textAlign: 'left',
            verticalAlign: 'top',
            minWidth: '8em',
            // セル内のリストが横幅を稼がないように詰める
            '& ul, & ol': { my: 0.5, pl: 2.5 },
          },
          '& th': { bgcolor: 'action.hover', fontWeight: 700 },
          '& pre': {
            overflowX: 'auto',
            p: 1.5,
            borderRadius: '6px',
            bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.900'),
            fontSize: '0.85em',
          },
          // Google のリリースノートが使う注記ブロック
          '& aside': {
            display: 'block',
            my: 2,
            px: 2,
            py: 1.5,
            borderLeft: '4px solid',
            borderColor: 'secondary.main',
            borderRadius: '0 6px 6px 0',
            bgcolor: 'action.hover',
            fontSize: '0.95em',
          },
        },

        // --- 共通のインライン要素 ---
        '& b, & strong': { fontWeight: 700 },
        '& blockquote': {
          m: 0,
          my: 2,
          pl: 3,
          py: 1,
          borderLeft: '4px solid',
          borderColor: 'secondary.main',
          bgcolor: 'action.hover',
          fontStyle: 'italic',
        },
        '& code': {
          px: 0.75,
          py: 0.25,
          borderRadius: '4px',
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
          fontSize: '0.88em',
          fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
        },
        '& pre code': { bgcolor: 'transparent', p: 0 },
        '& hr': { my: 4, border: '0', borderTop: '1px solid', borderColor: 'divider' },
        '& a': {
          color: 'primary.main',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'color 0.2s',
          '&:hover': { textDecoration: 'underline', color: 'primary.dark' },
        },
      }}
      dangerouslySetInnerHTML={{ __html: annotatedHtml }}
    />
  );
}
