import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    description?: string;
    className?: string;
    aspectRatio?: 'video' | 'square' | 'auto';
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
    value, 
    onChange, 
    label = 'Imagem de Capa',
    description = 'Faça upload ou cole um link de imagem (Recomendado: 16:9)',
    className = '',
    aspectRatio = 'video'
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('A imagem deve ter no máximo 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            onChange(url);
            toast.success('Imagem enviada com sucesso!');
        } catch (error: any) {
            console.error(error);
            toast.error(`Erro ao enviar: ${error.message || 'Tente usar uma URL.'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setShowUrlInput(false);
            setUrlInput('');
        }
    };

    const handleRemove = () => {
        onChange('');
        setShowUrlInput(false);
    };

    const aspectRatioClass = aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : '';

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-secondary">{label}</label>}
            
            {value ? (
                <div className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/50 group ${aspectRatioClass}`}>
                    <img src={value} alt="Capa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red/20 text-red border border-red/30 p-3 rounded-full hover:bg-red hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full relative overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors py-6 px-4 flex flex-col items-center justify-center text-center">
                    
                    {isUploading ? (
                        <div className="flex flex-col items-center text-primary">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <p className="text-sm font-medium">Enviando imagem...</p>
                        </div>
                    ) : showUrlInput ? (
                        <form onSubmit={handleUrlSubmit} className="w-full max-w-sm flex flex-col gap-3 animate-fade-in">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <LinkIcon size={18} />
                                <span className="text-sm font-bold">Colar URL da Imagem</span>
                            </div>
                            <input
                                type="url"
                                placeholder="https://exemplo.com/imagem.jpg"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="fp-input w-full"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="fp-btn-primary flex-1 py-2 text-sm">Adicionar</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowUrlInput(false)}
                                    className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center gap-4 animate-fade-in">
                            <div className="p-4 bg-primary/10 text-primary rounded-full">
                                <ImageIcon size={32} />
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white">{description}</p>
                                <p className="text-xs text-muted">JPG, PNG, GIF (Máx 5MB)</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="fp-btn-primary py-2 px-6 text-sm flex items-center gap-2"
                                >
                                    <Upload size={16} /> Fazer Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUrlInput(true)}
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-2 px-6 text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <LinkIcon size={16} /> Usar Link
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        className="hidden" 
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
