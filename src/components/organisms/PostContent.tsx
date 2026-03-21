'use client';

import * as React from 'react';
import { Box } from '@mui/material';

interface PostContentProps {
  contentHtml: string;
}

export default function PostContent({ contentHtml }: PostContentProps) {
  return (
    <Box
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
