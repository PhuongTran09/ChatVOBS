import './PhotoGallery.css';
import { useI18n } from '../i18n';

interface GalleryItem {
  id: string | number;
  src: string;
  thumb: string;
  name: string;
  date?: string;
}

interface PhotoGalleryProps {
  galleryItems: GalleryItem[];
  setSelectedImage: (image: { src: string; name: string } | null) => void;
}

export function PhotoGallery({ galleryItems, setSelectedImage }: PhotoGalleryProps) {
  const { t } = useI18n();

  return (
    <div className="gallery-container" id="gallery">
      <div className="section-head">
        <span className="badge badge-secondary">{t('gallery.badge')}</span>
      </div>
      <div className="gallery-viewport custom-scrollbar">
        <div className="gallery-track">
          {galleryItems.map((item) => (
            <div 
              className="gallery-item" 
              key={item.id}
              onClick={() => setSelectedImage({ src: item.src, name: item.name })}
            >
              <div className="img-frame">
                <img src={item.thumb} alt={item.name} />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">{item.name}</span>
                <span className="file-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
