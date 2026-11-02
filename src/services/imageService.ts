export const uploadImage = async (file: File): Promise<string> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    if (!apiKey) {
        throw new Error('ImgBB API Key não configurada no .env');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Falha no upload para o ImgBB');
        }

        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error('Erro no upload de imagem:', error);
        throw error;
    }
};
