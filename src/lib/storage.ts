import { supabase } from './supabase';

export interface BoxCell {
    id: string;
    name: string;
    content: string;
    type: 'sample' | 'control' | 'primers' | 'plasmid' | 'antibody' | 'reagent' | 'aliquot' | 'empty';
    updatedAt: number;
}

export interface Box {
    id: string;
    name: string;
    rows: number;
    cols: number;
    description?: string;
    cells: Record<string, BoxCell>; // key is "row-col"
    createdAt?: number;
    updatedAt?: number;
}

const STORAGE_KEY = 'biolab_boxes';

export const storage = {
    // LocalStorage fallback for migration
    getLegacyBoxes: (): Box[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to parse legacy boxes', e);
            return [];
        }
    },

    clearLegacy: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // Supabase operations
    getBoxes: async (): Promise<Box[]> => {
        const { data, error } = await supabase
            .from('boxes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching boxes:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            rows: row.rows,
            cols: row.cols,
            description: row.description,
            cells: row.cells,
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime()
        }));
    },

    saveBox: async (box: Box) => {
        const payload = {
            id: box.id,
            name: box.name,
            rows: box.rows,
            cols: box.cols,
            description: box.description,
            cells: box.cells
        };

        const { error } = await supabase
            .from('boxes')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error('Error saving box:', error);
            throw error;
        }
    },

    deleteBox: async (id: string) => {
        const { error } = await supabase
            .from('boxes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting box:', error);
            throw error;
        }
    },

    // Database Migration Logic
    migrateIfNeeded: async () => {
        // First check if Supabase is reachable
        try {
            const { error: pingError } = await supabase.from('boxes').select('id').limit(1);
            if (pingError) throw pingError;
        } catch (e) {
            console.warn('Supabase not reachable yet, skipping migration check.');
            return;
        }

        const legacyBoxes = storage.getLegacyBoxes();
        if (legacyBoxes.length > 0) {
            console.log(`Migrating ${legacyBoxes.length} legacy boxes to Supabase...`);
            for (const box of legacyBoxes) {
                await storage.saveBox(box);
            }
            storage.clearLegacy();
            console.log('Migration to Supabase complete.');
        }
    }
};
