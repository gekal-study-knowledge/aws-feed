import * as React from 'react';
import { Box } from '@mui/material';

interface PostContentProps {
  contentHtml: string;
}

export default function PostContent({ contentHtml }: PostContentProps) {
  return (
    <Box
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
          borderBottom: (theme) => `2px solid ${theme.palette.primary.light || '#eee'}`,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            width: '8px',
            height: '1.5em',
            bgcolor: 'primary.main',
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
        '& hr': { my: 6, border: '0', borderTop: '1px solid', borderColor: 'divider' },
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
