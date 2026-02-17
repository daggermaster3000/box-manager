import { useState } from 'react';
import type { Box } from '../lib/storage';
import { X } from 'lucide-react';

interface NewBoxModalProps {
    onClose: () => void;
    onSave: (box: Box) => void;
    editingBox?: Box;
}

export const NewBoxModal: React.FC<NewBoxModalProps> = ({ onClose, onSave, editingBox }) => {
    const [name, setName] = useState(editingBox?.name || '');
    const [rows, setRows] = useState(editingBox?.rows || 24);
    const [cols, setCols] = useState(editingBox?.cols || 24);
    const [description, setDescription] = useState(editingBox?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newBox: Box = {
            id: editingBox?.id || crypto.randomUUID(),
            name,
            rows,
            cols,
            description,
            cells: editingBox?.cells || {},
            createdAt: editingBox?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        onSave(newBox);
        onClose();
    };

    return (
        <div className="modal-overlay glass">
            <div className="modal-content glass">
                <div className="modal-header">
                    <h3>{editingBox ? 'Edit Box' : 'Create New Box'}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="box-form">
                    <div className="form-group">
                        <label>Box Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Cryo-A1"
                            required
                        />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Rows</label>
                            <input
                                type="number"
                                value={rows}
                                onChange={e => setRows(Number(e.target.value))}
                                min="1" max="50"
                            />
                        </div>
                        <div className="form-group">
                            <label>Cols</label>
                            <input
                                type="number"
                                value={cols}
                                onChange={e => setCols(Number(e.target.value))}
                                min="1" max="50"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary glow-emerald">Save Config</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
