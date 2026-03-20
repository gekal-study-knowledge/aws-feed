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
}

export default function PostCard({ slug, date, year, month, day, title }: PostCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Link
        href={`/posts/${year}/${month}/${day}/${slug}`}
        passHref
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <CardActionArea component="span" sx={{ flexGrow: 1 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" color="primary">
              {title}
              <VisitedIcon year={year} month={month} day={day} slug={slug} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {date}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
