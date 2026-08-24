import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { processAndUploadImage } from '../../utils/uploadService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function UploadMediaModal({ isOpen, onClose, eventId, onSuccess }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo imágenes.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress('Comprimiendo imagen...');

    try {
      // 1. Comprimir y subir a Cloudflare R2
      const { publicUrl, filePath, fileType } = await processAndUploadImage(selectedFile, eventId);
      
      setUploadProgress('Guardando recuerdo...');

      // 2. Guardar en la base de datos de Supabase usando el esquema 'media'
      const { error } = await supabase
        .from('media')
        .insert([{
          event_id: eventId,
          guest_id: "bb6459d2-22b5-4cf9-8d83-e60db174d35a",
          file_url: publicUrl,
          file_path: filePath,
          file_type: fileType,
          message: message.trim() || null,
          taken_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // 3. Finalizar
      onSuccess();
      handleClose();
      
    } catch (error) {
      console.error('Error en el flujo de subida:', error);
      alert('Hubo un error al subir la foto. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setMessage('');
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-black/5">
          <h3 className="font-headline text-lg font-medium">Compartir Recuerdo</h3>
          <button 
            onClick={handleClose} 
            disabled={isUploading}
            className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* File Selection / Preview Area */}
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-neutral-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <div className="text-center">
                <p className="font-sans text-sm font-semibold text-neutral-700">Toca para tomar una foto</p>
                <p className="font-sans text-xs text-neutral-400 mt-1">o selecciona de tu galería</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/5 group">
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                className="w-full h-auto max-h-[50vh] object-contain" 
              />
              {!isUploading && (
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Message Input */}
          {previewUrl && (
            <div className="space-y-1.5 animate-in slide-in-from-bottom-4 duration-300">
              <label className="font-sans text-xs font-medium text-neutral-500 ml-1">Mensaje (Opcional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe algo sobre este momento..."
                disabled={isUploading}
                className="w-full p-4 bg-neutral-50 border border-transparent rounded-2xl font-sans text-sm outline-none focus:border-neutral-200 focus:bg-white transition-all resize-none h-24 disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/5 bg-white">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full py-4 rounded-full bg-black text-white font-sans text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors flex justify-center items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{uploadProgress}</span>
              </>
            ) : (
              <span>Subir Foto</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
