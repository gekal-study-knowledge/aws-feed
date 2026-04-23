'use client';

import * as React from 'react';
import { Box } from '@mui/material';

interface PostContentProps {
  contentHtml: string;
  newSince?: string;
}

// "2026-04-24 07:36:02 JST" → "2026-04-24 07:36:02"
const normalizeTimestamp = (ts: string): string => ts.replace(/\s+JST$/i, '').trim().slice(0, 19);

export default function PostContent({ contentHtml, newSince }: PostContentProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!newSince || !containerRef.current) return;

    const threshold = normalizeTimestamp(newSince);
    const container = containerRef.current;

    container.querySelectorAll('h3').forEach((h3) => {
      // 既存バッジを除去（依存変更時の重複防止）
      h3.querySelector('.new-entry-badge')?.remove();

      // h3 の直後にある ul を探す（h2/h3 が来たら打ち切り）
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== 'UL' && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
        sibling = sibling.nextElementSibling;
      }
      if (!sibling || sibling.tagName !== 'UL') return;

      // Fetched: の値を取得
      const fetchedLi = Array.from(sibling.querySelectorAll('li')).find((li) =>
        li.textContent?.includes('Fetched'),
      );
      const fetchedMatch = fetchedLi?.textContent?.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      const fetchedTime = fetchedMatch?.[1];

      if (fetchedTime && fetchedTime > threshold) {
        const badge = document.createElement('span');
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
        h3.appendChild(badge);
      }
    });
  }, [newSince, contentHtml]);

  return (
    <Box
      ref={containerRef}
      className="markdown-body"
      sx={{
        mt: 4,
        mb: 8,
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          mb: 3,
        },
        '& h2': {
          mt: 6,
          mb: 3,
          color: 'primary.main',
          fontSize: { xs: '1.5rem', md: '1.875rem' },
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
          },
        },
        '& h3': {
          mt: 4,
          mb: 2,
          fontWeight: 600,
        },
        '& p': {
          mb: 2,
          lineHeight: 1.8,
        },
        '& ul, & ol': {
          mt: 2,
          mb: 2,
          pl: 4,
        },
        '& li': {
          mb: 1,
          lineHeight: 1.8,
        },
        '& b, & strong': {
          fontWeight: 700,
        },
        '& br': {
          display: 'block',
          content: '""',
          mt: 1,
        },
        '& blockquote': {
          m: 0,
          pl: 3,
          py: 1,
          borderLeft: '4px solid',
          borderColor: 'secondary.main',
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(255, 153, 0, 0.05)' : 'rgba(255, 153, 0, 0.1)',
          fontStyle: 'italic',
        },
        '& code': {
          px: 1,
          py: 0.5,
          borderRadius: '4px',
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
          fontSize: '0.9em',
          fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
        },
        '& hr': {
          my: 6,
          border: '0',
          borderTop: '1px solid',
          borderColor: 'divider',
        },
        '& a': {
          color: 'primary.main',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'color 0.2s',
          '&:hover': { textDecoration: 'underline', color: 'primary.dark' },
        },
      }}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
