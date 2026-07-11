import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import './SocialNews.css';
import { useI18n } from '../i18n';
import { subscribeToNews, db, type CombinedNewsArticle } from '../services';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
}

export function SocialNews() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<CombinedNewsArticle | null>(null);
  const [newsArticles, setNewsArticles] = useState<CombinedNewsArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to newsCategories
  useEffect(() => {
    const categoriesQuery = query(collection(db, 'newsCategories'));
    const unsubscribe = onSnapshot(categoriesQuery, (snap) => {
      const cats: CategoryItem[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        cats.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
        });
      });
      setCategories(cats);
    }, (error) => {
      console.error('Error loading news categories:', error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToNews(
      (data) => {
        setNewsArticles(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading news:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync selectedNews with updated article in the articles list when real-time updates occur
  useEffect(() => {
    if (selectedNews) {
      const updated = newsArticles.find((art) => art.id === selectedNews.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedNews)) {
        setSelectedNews(updated);
      }
    }
  }, [newsArticles, selectedNews]);

  // Automatically open shared news article if newsId is in the URL search params or path
  useEffect(() => {
    if (!loading && newsArticles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      let newsId = params.get('newsId');

      if (!newsId) {
        // Parse from URL pathname format: /feed/{type}/{id}/new
        const pathMatch = window.location.pathname.match(/\/feed\/[^/]+\/([^/]+)\/new/);
        if (pathMatch) {
          newsId = pathMatch[1];
        }
      }

      if (newsId) {
        const found = newsArticles.find((art) => art.id === newsId);
        if (found) {
          setSelectedNews(found);
        }
      }
    }
  }, [loading, newsArticles]);

  const getArticleType = (article: CombinedNewsArticle): 'announcement' | 'milestone' | 'media' => {
    const categoryName = (article.categoryName || '').toLowerCase().trim();
    if (categoryName === 'thông báo' || categoryName === 'announcement' || categoryName === 'announcements') {
      return 'announcement';
    }
    if (categoryName === 'cột mốc' || categoryName === 'milestone' || categoryName === 'milestones') {
      return 'milestone';
    }
    if (categoryName === 'media' || categoryName === 'phương tiện') {
      return 'media';
    }
    return 'announcement'; // fallback
  };

  const getArticlePlatform = (article: CombinedNewsArticle): 'system' | 'youtube' | 'discord' | 'github' => {
    const icon = (article.icon || '').toLowerCase().trim();
    if (icon === 'youtube' || icon === 'discord' || icon === 'github' || icon === 'system') {
      return icon as 'system' | 'youtube' | 'discord' | 'github';
    }
    return 'system';
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  const getCategoryDisplayName = (article: CombinedNewsArticle): string => {
    const type = getArticleType(article);
    const translated = t(`social.news.filter.${type}`);
    return translated || article.categoryName;
  };

  const getShareLink = (newsId: string, type: string): string => {
    const origin = window.location.origin;
    return `${origin}/feed/${type}/${newsId}/new`;
  };

  const handleShare = async (e: MouseEvent, item: CombinedNewsArticle) => {
    e.stopPropagation();
    const type = getArticleType(item);
    const shareUrl = getShareLink(item.id, type);
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.content,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log('navigator.share failed, fallback to copy clipboard:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage(t('news.share.copied'));
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const filteredNews = useMemo(() => {
    return newsArticles.filter((item) => {
      const matchesFilter = filter === 'all' || item.categoryId === filter;
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = title.includes(query) || content.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [newsArticles, filter, searchQuery]);

  const platformIcons = {
    system: (
      <svg className="platform-icon sys" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    youtube: (
      <svg className="platform-icon yt" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    discord: (
      <svg className="platform-icon dc" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.21,16.15c2.45-3.35,4.63-6.9,6.51-10.63a67.06,67.06,0,0,1-10.41-5c.87-.64,1.71-1.31,2.53-2a82.5,82.5,0,0,0,51.84,0c.81.69,1.66,1.36,2.53,2a67.1,67.1,0,0,1-10.41,5c1.88,3.73,4.06,7.28,6.51,10.63a105.4,105.4,0,0,0,32.24-16.15C129.58,51,123.46,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.9,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.43-12.74S96.11,45.92,96.11,53,91,65.69,82.69,65.69Z" />
      </svg>
    ),
    github: (
      <svg className="platform-icon gh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    )
  };

  const getCategoryNameDisplay = (catName: string): string => {
    const nameLower = catName.toLowerCase().trim();
    let type = '';
    if (nameLower === 'thông báo' || nameLower === 'announcement' || nameLower === 'announcements') {
      type = 'announcement';
    } else if (nameLower === 'cột mốc' || nameLower === 'milestone' || nameLower === 'milestones') {
      type = 'milestone';
    } else if (nameLower === 'media' || nameLower === 'phương tiện') {
      type = 'media';
    }
    if (type) {
      return t(`social.news.filter.${type}`);
    }
    return catName.toUpperCase();
  };

  return (
    <div className="social-news-container" id="news">
      <div className="news-header">
        <div className="news-header-left">
          <span className="badge badge-secondary">{t('social.news.badge')}</span>
          <h2>{t('social.news.title')}</h2>
        </div>
        
        {/* Search Input */}
        <div className="news-search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="news-search-input"
            placeholder={t('news.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="news-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('social.news.filter.all')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-tab ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {getCategoryNameDisplay(cat.name)}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="news-feed-list custom-scrollbar">
        {loading ? (
          <div className="empty-feed">
            <span className="blink-text">&gt; ESTABLISHING_SECURE_CONNECTION...</span>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="feed-grid">
            {filteredNews.map((item) => {
              const type = getArticleType(item);
              const platform = getArticlePlatform(item);
              return (
                <div key={item.id} className={`news-card type-${type}`} onClick={() => setSelectedNews(item)} style={{ cursor: 'pointer' }}>
                  <div className="card-scanline" />
                  <div className="card-border-glow" />
                  
                  {/* Top metadata */}
                  <div className="card-meta">
                    <span className="news-badge">
                      <span className="badge-pulse" />
                      {getCategoryDisplayName(item)}
                    </span>
                    <span className="news-date">{formatDate(item.publishedAt)}</span>
                  </div>

                  {/* Title & Platform */}
                  <div className="card-header">
                    {platformIcons[platform]}
                    <h3 className="news-title">{item.title}</h3>
                  </div>

                  {/* Content */}
                  <div className="news-content" dangerouslySetInnerHTML={{ __html: item.content }} />

                  {/* Card Actions */}
                  <div className="card-footer" style={{ display: 'flex', gap: '10px' }}>
                    <span className="news-action-btn view-btn" style={{ flex: 1, textAlign: 'center' }}>
                      {t('news.button.view')}
                    </span>
                    <button 
                      className="cyber-btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--magenta)',
                        color: 'var(--magenta)',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.25s'
                      }}
                      onClick={(e) => handleShare(e, item)}
                    >
                      {t('news.button.share')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-feed">
            <span className="blink-text">&gt; NO_LOGS</span>
          </div>
        )}
      </div>

      {/* Cyberpunk News Detail Modal */}
      {selectedNews && createPortal(
        <div className="news-modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-scanline" />
            <div className="modal-corner top-left" />
            <div className="modal-corner top-right" />
            <div className="modal-corner bottom-left" />
            <div className="modal-corner bottom-right" />
            
            <div className="modal-meta-bar">
              <span className={`modal-badge badge-${getArticleType(selectedNews)}`}>
                {getCategoryDisplayName(selectedNews)}
              </span>
              <span className="modal-date">{formatDate(selectedNews.publishedAt)}</span>
            </div>

            <div className="modal-header">
              {platformIcons[getArticlePlatform(selectedNews)]}
              <h2 className="modal-title">{selectedNews.title}</h2>
            </div>

            <div className="modal-terminal-body custom-scrollbar">
              <div className="modal-description" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
              
              <div className="terminal-divider" />
              <div className="terminal-log-row blink-text" style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>
                <span>&gt; MORE</span>
              </div>
              {selectedNews.moreLink && (
                <div className="terminal-log-row" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedNews.moreLinkIcon && selectedNews.moreLinkIcon.toLowerCase() in platformIcons && (
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {platformIcons[selectedNews.moreLinkIcon.toLowerCase() as keyof typeof platformIcons]}
                    </span>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    {selectedNews.moreLinkName || 'Link'}:
                  </span>
                  <a 
                    href={selectedNews.moreLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="blink-text"
                    style={{ 
                      color: 'var(--cyan)', 
                      textDecoration: 'none', 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}
                  >
                    {selectedNews.moreLink}
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button className="cyber-btn outline-cyan" onClick={() => setSelectedNews(null)}>
                [CLOSE]
              </button>

              <button className="cyber-btn outline-green" onClick={(e) => handleShare(e, selectedNews)}>
                {t('news.button.share')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="cyber-toast">
          <span className="blink-text">&gt; {toastMessage}</span>
        </div>
      )}
    </div>
  );
}
