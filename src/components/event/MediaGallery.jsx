import React, { useState, useEffect } from 'react';
import { LayoutGrid, Rows3, Loader2 } from 'lucide-react';
import PhotoCard from './PhotoCard';

export default function MediaGallery({ photos = [], emptyStateMessage = "Aún no hay fotos.", blurImage = false, onUnlock }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'feed'
  const [columnsCount, setColumnsCount] = useState(2);
  const [isCalculating, setIsCalculating] = useState(false);
  const [masonryColumns, setMasonryColumns] = useState([]);

  // 1. Detectar tamaño de pantalla para definir número de columnas
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumnsCount(4); // lg
      else if (width >= 768) setColumnsCount(3); // md
      else setColumnsCount(2); // sm
    };
    handleResize(); // trigger inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Algoritmo "Shortest-Column" (Masonry Real)
  useEffect(() => {
    if (photos.length === 0 || viewMode !== 'grid') return;

    let isMounted = true;
    setIsCalculating(true);

    const loadImage = (photo) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = photo.file_url;
        img.onload = () => {
          let height = img.naturalHeight;
          let width = img.naturalWidth;
          // Evitar "jirafas": limitar a proporción 2:3
          const ratio = height / width;
          const adjustedRatio = ratio > 1.5 ? 1.5 : ratio;
          resolve({ ...photo, calculatedRatio: adjustedRatio });
        };
        img.onerror = () => {
          resolve({ ...photo, calculatedRatio: 1 }); // fallback a cuadrado
        };
      });
    };

    Promise.all(photos.map(loadImage)).then((loadedPhotos) => {
      if (!isMounted) return;

      const cols = Array.from({ length: columnsCount }, () => []);
      const heights = Array.from({ length: columnsCount }, () => 0);

      loadedPhotos.forEach((photo) => {
        // Encontrar columna más corta
        const shortestIndex = heights.indexOf(Math.min(...heights));
        cols[shortestIndex].push(photo);
        // Sumar altura relativa
        heights[shortestIndex] += photo.calculatedRatio;
      });

      setMasonryColumns(cols);
      setIsCalculating(false);
    });

    return () => { isMounted = false; };
  }, [photos, columnsCount, viewMode]);

  if (photos.length === 0) {
    return (
      <div className="py-16 text-center space-y-2 text-neutral-400 bg-white rounded-3xl border border-dashed border-black/10">
        <p className="font-sans text-sm">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toggle Vistas */}
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-1 bg-white border border-black/5 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}
            title="Vista Grid"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`p-2 rounded-full transition-all flex items-center justify-center ${viewMode === 'feed' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}
            title="Vista Feed"
          >
            <Rows3 size={18} />
          </button>
        </div>
      </div>

      {/* Contenedor de Galería */}
      {viewMode === 'grid' ? (
        isCalculating ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400 space-y-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="font-sans text-sm">Organizando galería...</p>
          </div>
        ) : (
          <div className="flex gap-1 w-full">
            {masonryColumns.map((column, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-1 min-w-0">
                {column.map((photo, idx) => (
                  <PhotoCard key={photo.id || idx} photo={photo} blurImage={blurImage} onUnlock={onUnlock} viewMode={viewMode} />
                ))}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-8 max-w-xl mx-auto w-full">
          {photos.map((photo, idx) => (
            <PhotoCard key={photo.id || idx} photo={photo} blurImage={blurImage} onUnlock={onUnlock} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
