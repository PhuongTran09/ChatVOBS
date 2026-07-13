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
      <svg className="platform-icon dc" viewBox="0 -28.5 256 256" fill="currentColor">
        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fillRule="nonzero" />
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
