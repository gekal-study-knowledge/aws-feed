import { useState, useEffect, useCallback } from 'react';

export const VISITED_KEY = 'visited_posts';

/** localStorage 更新をアプリ全体へ通知するイベント名 */
export const VISITED_UPDATED_EVENT = 'visited-posts-updated';

export interface VisitRecord {
  counter: number;
  visitedAt?: string; // JST訪問時刻 "YYYY-MM-DD HH:MM:SS"
  lastUpdated?: string; // 旧フォーマット互換
}

// JST現在時刻を "YYYY-MM-DD HH:MM:SS" 形式で返す
export const getJSTNow = (): string => {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace('T', ' ').slice(0, 19);
};

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

// ---------------------------------------------------------------------------
// クラウド同期フック
// ログイン中はここに ReadStatusProvider が同期関数を登録し、localStorage への
// 書き込みを Firestore へ反映する。未登録（未ログイン）時は何もしない。
// ---------------------------------------------------------------------------
type CloudSyncFn = (records: Record<string, VisitRecord>) => void;
let cloudSync: CloudSyncFn | null = null;

export const setCloudSync = (fn: CloudSyncFn | null): void => {
  cloudSync = fn;
};

/** localStorage のみ更新し、変更イベントを発火する（クラウドへは反映しない）。
 *  Firestore からのハイドレーション時に使用し、同期ループを避ける。 */
export const saveVisitedPostsLocal = (visitedPosts: Record<string, VisitRecord>): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VISITED_KEY, JSON.stringify(visitedPosts));
  window.dispatchEvent(new CustomEvent(VISITED_UPDATED_EVENT));
};

/** localStorage を更新し、変更イベント発火＋（ログイン中なら）クラウドへ反映する。
 *  コンポーネントからのユーザー操作による書き込みはこちらを使う。 */
export const saveVisitedPosts = (visitedPosts: Record<string, VisitRecord>): void => {
  saveVisitedPostsLocal(visitedPosts);
  cloudSync?.(visitedPosts);
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
    const sync = () => {
      const visitedPosts = getVisitedPosts();
      const record = visitedPosts[currentPostId];

      if (record !== undefined) {
        setIsVisited(true);
        setIsUpdated(record.counter !== newsCounter);
      } else {
        setIsVisited(false);
        setIsUpdated(false);
      }
    };

    sync();
    // localStorage が更新（クラウド同期含む）されたら再評価する
    window.addEventListener(VISITED_UPDATED_EVENT, sync);
    return () => window.removeEventListener(VISITED_UPDATED_EVENT, sync);
  }, [currentPostId, newsCounter]);

  const markAsVisited = useCallback(() => {
    const visitedPosts = getVisitedPosts();
    const record = visitedPosts[currentPostId];

    if (!record || record.counter !== newsCounter) {
      visitedPosts[currentPostId] = { counter: newsCounter, visitedAt: getJSTNow() };
      saveVisitedPosts(visitedPosts);
      setIsVisited(true);
      setIsUpdated(false);
    }
  }, [currentPostId, newsCounter]);

  return { isVisited, isUpdated, markAsVisited };
};
