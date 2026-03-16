import { create } from 'zustand';
import { templateService } from './templateService';
import type { TournamentTemplate } from '../../types';

interface TemplateStore {
    templates: TournamentTemplate[];
    isLoading: boolean;
    error: string | null;
    loadTemplates: (userId: string) => Promise<void>;
    saveTemplate: (userId: string, data: Partial<TournamentTemplate>) => Promise<TournamentTemplate | null>;
    deleteTemplate: (userId: string, templateId: string) => Promise<boolean>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
    templates: [],
    isLoading: false,
    error: null,

    loadTemplates: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const temps = await templateService.getUserTemplates(userId);
            set({ templates: temps, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    saveTemplate: async (userId: string, data: Partial<TournamentTemplate>) => {
        set({ isLoading: true, error: null });
        try {
            const newTemp = await templateService.saveTemplate(userId, data);
            set(state => ({
                templates: [newTemp, ...state.templates.filter(t => t.id !== newTemp.id)],
                isLoading: false
            }));
            return newTemp;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            return null;
        }
    },

    deleteTemplate: async (userId: string, templateId: string) => {
        set({ isLoading: true, error: null });
        try {
            await templateService.deleteTemplate(userId, templateId);
            set(state => ({
                templates: state.templates.filter(t => t.id !== templateId),
                isLoading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            return false;
        }
    }
}));
