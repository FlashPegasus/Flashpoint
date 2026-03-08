import toast from 'react-hot-toast';

export const getBaseUrl = (): string => {
    let baseUrl = window.location.origin;
    // For local development or Capacitor (mobile), point to production web app for sharing links
    if (baseUrl.includes('localhost') || baseUrl.includes('capacitor://')) {
        baseUrl = 'https://flashpoint-anti.web.app';
    }
    return baseUrl;
};

export const getInviteLink = (type: 'tournament' | 'league', codeOrId: string): string => {
    const baseUrl = getBaseUrl();
    const path = type === 'tournament' ? 'join' : 'join-league';
    return `${baseUrl}/${path}/${codeOrId}`;
};

export const copyToClipboard = async (text: string, successMessage: string = 'Copiado com sucesso!') => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
        return true;
    } catch (err) {
        console.error('Falha ao copiar:', err);
        toast.error('Erro ao copiar. Tente selecionar o texto.');
        return false;
    }
};
