import './ImageModal.css';

interface ImageModalProps {
  selectedImage: { src: string; name: string } | null;
  onClose: () => void;
}

export function ImageModal({ selectedImage, onClose }: ImageModalProps) {
  if (!selectedImage) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>×</button>
        <img src={selectedImage.src} alt={selectedImage.name} />
        <div className="image-modal-info">
          <h4>{selectedImage.name}</h4>
        </div>
      </div>
    </div>
  );
}
