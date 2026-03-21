import { useState, useEffect, useCallback } from 'react';

const VISITED_KEY = 'visited_posts';

const getVisitedPosts = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};

  let visitedPosts: Record<string, number> = {};
  try {
    const parsedData = JSON.parse(localStorage.getItem(VISITED_KEY) || '{}');

    if (Array.isArray(parsedData)) {
      parsedData.forEach((postId) => {
        if (typeof postId === 'string') {
          visitedPosts[postId] = -1;
        }
      });
    } else if (parsedData !== null && typeof parsedData === 'object') {
      visitedPosts = parsedData as Record<string, number>;
    }
  } catch (error) {
    console.error('Failed to parse visited_posts:', error);
  }
  return visitedPosts;
};

interface UseVisitedPostProps {
  year: string;
  month: string;
  day: string;
  slug: string;
  newsCounter: number;
}

export const useVisitedPost = ({ year, month, day, slug, newsCounter }: UseVisitedPostProps) => {
  const [isVisited, setIsVisited] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const currentPostId = `${year}/${month}/${day}/${slug}`;

  useEffect(() => {
    const visitedPosts = getVisitedPosts();
    const postCounter = visitedPosts[currentPostId];

    if (postCounter !== undefined) {
      setIsVisited(true);
      // ご提示いただいたコードに合わせて !== にしています
      setIsUpdated(postCounter !== newsCounter);
    } else {
      setIsVisited(false);
      setIsUpdated(false);
    }
  }, [currentPostId, newsCounter]);

  const markAsVisited = useCallback(() => {
    const visitedPosts = getVisitedPosts();

    if (visitedPosts[currentPostId] !== newsCounter) {
      visitedPosts[currentPostId] = newsCounter;
      localStorage.setItem(VISITED_KEY, JSON.stringify(visitedPosts));

      // 保存完了に合わせて、ステートも最新状態に同期させておく
      setIsVisited(true);
      setIsUpdated(false); // 最新の値を保存したので、差分は無くなる
    }
  }, [currentPostId, newsCounter]);

  return { isVisited, isUpdated, markAsVisited };
};
