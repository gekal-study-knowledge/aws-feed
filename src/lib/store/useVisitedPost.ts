import { useState, useEffect, useCallback } from 'react';

export const VISITED_KEY = 'visited_posts';

export interface VisitRecord {
  counter: number;
  lastUpdated?: string;
}

export const getVisitedPosts = (): Record<string, VisitRecord> => {
  if (typeof window === 'undefined') return {};

  const result: Record<string, VisitRecord> = {};
  try {
    const raw = JSON.parse(localStorage.getItem(VISITED_KEY) || '{}');
    if (Array.isArray(raw)) {
      raw.forEach((postId) => {
        if (typeof postId === 'string') result[postId] = { counter: -1 };
      });
    } else if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([key, val]) => {
        if (typeof val === 'number') {
          result[key] = { counter: val };
        } else if (val && typeof val === 'object') {
          result[key] = val as VisitRecord;
        }
      });
    }
  } catch (error) {
    console.error('Failed to parse visited_posts:', error);
  }
  return result;
};

export const saveVisitedPosts = (visitedPosts: Record<string, VisitRecord>) => {
  localStorage.setItem(VISITED_KEY, JSON.stringify(visitedPosts));
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
    const record = visitedPosts[currentPostId];

    if (record !== undefined) {
      setIsVisited(true);
      setIsUpdated(record.counter !== newsCounter);
    } else {
      setIsVisited(false);
      setIsUpdated(false);
    }
  }, [currentPostId, newsCounter]);

  const markAsVisited = useCallback(
    (lastUpdated?: string) => {
      const visitedPosts = getVisitedPosts();
      const record = visitedPosts[currentPostId];

      if (!record || record.counter !== newsCounter || record.lastUpdated !== lastUpdated) {
        visitedPosts[currentPostId] = { counter: newsCounter, lastUpdated };
        saveVisitedPosts(visitedPosts);
        setIsVisited(true);
        setIsUpdated(false);
      }
    },
    [currentPostId, newsCounter],
  );

  return { isVisited, isUpdated, markAsVisited };
};
