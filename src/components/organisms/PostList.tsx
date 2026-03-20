import * as React from 'react';
import Grid from '@mui/material/Grid';
import PostCard from '@/components/molecules/PostCard';

interface PostData {
  slug: string;
  date: string;
  year: string;
  month: string;
  day: string;
  title: string;
}

interface PostListProps {
  posts: PostData[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid
          key={`${post.year}-${post.month}-${post.day}-${post.slug}`}
          size={{ xs: 12, sm: 6, md: 4 }}
        >
          <PostCard {...post} />
        </Grid>
      ))}
    </Grid>
  );
}
