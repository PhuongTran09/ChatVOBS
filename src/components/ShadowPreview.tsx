import { useEffect, useRef } from "react";

interface ShadowPreviewProps {
  htmlContent: string;
  cssContent?: string;
  className?: string;
  id?: string;
}

export function ShadowPreview({
  htmlContent,
  cssContent = "",
  className,
  id,
}: ShadowPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  // Inject fonts to main document as they are global
  useEffect(() => {
    // Tìm các font-family được sử dụng trong cssContent
    // Regex bắt lấy tên font trước dấu ; hoặc !important
    const fontMatches = cssContent.match(/font-family:\s*([^;!]+)/g) || [];
    const usedFonts = Array.from(new Set(
      fontMatches.map(m => {
        let name = m.replace(/font-family:\s*/, '').trim();
        // Xóa ngoặc kép/ngoặc đơn
        name = name.replace(/["']/g, '');
        // Lấy font đầu tiên nếu có danh sách font
        return name.split(',')[0].trim();
      })
    )).filter(f => f && !['inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace'].includes(f.toLowerCase()));

    usedFonts.forEach(font => {
      const fontId = `font-${font.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css?family=${font.replace(/\s+/g, '+')}:400,700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [cssContent]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let shadow = host.shadowRoot;

    if (!shadow) {
      shadow = host.attachShadow({
        mode: "open",
      });
    }

    // Reset + inject content
    shadow.innerHTML = `
      <style>
        /* Reset isolation */
        :host {
          all: initial;
          display: block;
          contain: content;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        img,
        video {
          max-width: 100%;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        ${cssContent}
      </style>

      <div class="shadow-root-container">
        ${htmlContent}
      </div>
    `;
  }, [htmlContent, cssContent]);

  return (
    <div
      ref={hostRef}
      id={id}
      className={className}
    />
  );
}