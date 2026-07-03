import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
}

export interface NewsArticle {
  id: string;
  categoryId: string;
  content: string;
  icon: string;
  publishedAt: string;
  title: string;
  link?: string;
  moreLink?: string;
  moreLinkIcon?: string;
  moreLinkName?: string;
}

export interface CombinedNewsArticle {
  id: string;
  categoryId: string;
  content: string;
  icon: string;
  publishedAt: string;
  title: string;
  link?: string;
  moreLink?: string;
  moreLinkIcon?: string;
  moreLinkName?: string;
  categoryName: string;
  categoryDescription: string;
}

/**
 * Subscribes to newsArticles and newsCategories in real-time and combines them.
 * Returns an unsubscribe function.
 */
export function subscribeToNews(
  onUpdate: (articles: CombinedNewsArticle[]) => void,
  onError: (err: any) => void
): () => void {
  let categories: NewsCategory[] = [];
  let articles: NewsArticle[] = [];

  const emitCombined = () => {
    const categoryMap = new Map<string, NewsCategory>();
    categories.forEach((cat) => categoryMap.set(cat.id, cat));

    const combined: CombinedNewsArticle[] = articles.map((art) => {
      const category = categoryMap.get(art.categoryId);
      return {
        id: art.id,
        categoryId: art.categoryId,
        content: art.content,
        icon: art.icon,
        publishedAt: art.publishedAt,
        title: art.title,
        link: art.link || '',
        moreLink: art.moreLink || '',
        moreLinkIcon: art.moreLinkIcon || '',
        moreLinkName: art.moreLinkName || '',
        categoryName: category ? category.name : '',
        categoryDescription: category ? category.description : '',
      };
    });

    // Sort by publishedAt in descending order (newest first)
    combined.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    onUpdate(combined);
  };

  const categoriesQuery = query(collection(db, 'newsCategories'));
  const articlesQuery = query(collection(db, 'newsArticles'));

  const unsubCategories = onSnapshot(
    categoriesQuery,
    (snap) => {
      categories = [];
      snap.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
        });
      });
      emitCombined();
    },
    onError
  );

  const unsubArticles = onSnapshot(
    articlesQuery,
    (snap) => {
      articles = [];
      snap.forEach((doc) => {
        const data = doc.data();
        articles.push({
          id: doc.id,
          categoryId: data.categoryId || '',
          content: data.content || '',
          icon: data.icon || 'system',
          publishedAt: data.publishedAt || '',
          title: data.title || '',
          link: data.link || '',
          moreLink: data.moreLink || '',
          moreLinkIcon: data.moreLinkIcon || '',
          moreLinkName: data.moreLinkName || '',
        });
      });
      emitCombined();
    },
    onError
  );

  return () => {
    unsubCategories();
    unsubArticles();
  };
}

/**
 * Fetches both newsArticles and newsCategories once and returns combined articles.
 */
export async function fetchNews(): Promise<CombinedNewsArticle[]> {
  const categoriesQuery = query(collection(db, 'newsCategories'));
  const articlesQuery = query(collection(db, 'newsArticles'));

  const [categoriesSnap, articlesSnap] = await Promise.all([
    getDocs(categoriesQuery),
    getDocs(articlesQuery),
  ]);

  const categories: NewsCategory[] = [];
  categoriesSnap.forEach((doc) => {
    const data = doc.data();
    categories.push({
      id: doc.id,
      name: data.name || '',
      description: data.description || '',
    });
  });

  const categoryMap = new Map<string, NewsCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const articles: CombinedNewsArticle[] = [];
  articlesSnap.forEach((doc) => {
    const data = doc.data();
    const category = categoryMap.get(data.categoryId || '');
    articles.push({
      id: doc.id,
      categoryId: data.categoryId || '',
      content: data.content || '',
      icon: data.icon || 'system',
      publishedAt: data.publishedAt || '',
      title: data.title || '',
      link: data.link || '',
      moreLink: data.moreLink || '',
      moreLinkIcon: data.moreLinkIcon || '',
      moreLinkName: data.moreLinkName || '',
      categoryName: category ? category.name : '',
      categoryDescription: category ? category.description : '',
    });
  });

  // Sort by publishedAt in descending order (newest first)
  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return articles;
}
