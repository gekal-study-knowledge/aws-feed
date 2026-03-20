import * as React from 'react';
import { getPostData, getAllPostSlugs } from '@/lib/posts';
import PostLayout from '@/components/templates/PostLayout';
import type { Metadata } from 'next';

interface PostProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const { year, month, day, slug } = await params;
  const postData = await getPostData(year, month, day, slug);
  return {
    title: postData.title,
  };
}

export async function generateStaticParams() {
  const allPostParams = getAllPostSlugs();
  return allPostParams.map((p) => ({
    year: p.params.year,
    month: p.params.month,
    day: p.params.day,
    slug: p.params.slug,
  }));
}

export const dynamicParams = false;

export default async function Post({ params }: PostProps) {
  const { year, month, day, slug } = await params;
  const postData = await getPostData(year, month, day, slug);

  return (
    <PostLayout
      title={postData.title}
      date={postData.date}
      lastUpdated={postData.lastUpdated}
      contentHtml={postData.contentHtml || ''}
      previous={postData.previous}
      next={postData.next}
      year={year}
      month={month}
      day={day}
      slug={slug}
    />
  );
}
