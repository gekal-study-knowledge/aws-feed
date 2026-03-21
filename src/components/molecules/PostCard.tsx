'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import VisitedIcon from '@/components/atoms/VisitedIcon';

interface PostCardProps {
  slug: string;
  date: string;
  year: string;
  month: string;
  day: string;
  title: string;
  newsCounter?: number;
}

export default function PostCard({
  slug,
  date,
  year,
  month,
  day,
  title,
  newsCounter,
}: PostCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 8px 16px rgba(0,0,0,0.1)'
              : '0 8px 16px rgba(0,0,0,0.4)',
        },
      }}
    >
      <Link
        href={`/posts/${year}/${month}/${day}/${slug}`}
        passHref
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <CardActionArea component="span" sx={{ flexGrow: 1 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" color="primary">
              {title}
              <VisitedIcon
                year={year}
                month={month}
                day={day}
                slug={slug}
                newsCounter={newsCounter}
              />
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{date}</span>
              {newsCounter !== undefined && (
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  {newsCounter} 件の更新
                </Typography>
              )}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
