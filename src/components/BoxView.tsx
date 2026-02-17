import { useState } from 'react';
import type { Box, BoxCell } from '../lib/storage';
import { GridSystem } from './GridSystem';
import { QRCodeLabel } from './QRCodeLabel';
import { ArrowLeft, Save, Trash2, Edit3, Printer } from 'lucide-react';
import './GridSystem.css';
import './QRCodeLabel.css';

interface BoxViewProps {
    box: Box;
    onBack: () => void;
    onUpdate: (box: Box) => void;
    onDelete: (id: string) => void;
}

export const BoxView: React.FC<BoxViewProps> = ({ box, onBack, onUpdate, onDelete }) => {
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
    const [cellEditData, setCellEditData] = useState<Partial<BoxCell>>({});
    const [showQR, setShowQR] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [tempRows, setTempRows] = useState(box.rows);
    const [tempCols, setTempCols] = useState(box.cols);

    const handleCellClick = (row: number, col: number) => {
        setSelectedCell({ row, col });
        const cellId = `${row}-${col}`;
        const cell = box.cells[cellId] || { name: '', content: '', type: 'empty' };
        setCellEditData(cell);
    };

    const saveCellData = async () => {
        if (!selectedCell) return;
        const cellId = `${selectedCell.row}-${selectedCell.col}`;
        const updatedBox = {
            ...box,
            cells: {
                ...box.cells,
                [cellId]: {
                    id: cellId,
                    name: cellEditData.name || '',
                    content: cellEditData.content || '',
                    type: (cellEditData.type as any) || 'sample',
                    updatedAt: Date.now()
                }
            }
        };
        await onUpdate(updatedBox);
    };

    const clearCell = async () => {
        if (!selectedCell) return;
        const cellId = `${selectedCell.row}-${selectedCell.col}`;
        const newCells = { ...box.cells };
        delete newCells[cellId];
        await onUpdate({ ...box, cells: newCells });
        setCellEditData({ name: '', content: '', type: 'empty' });
    };

    const handleResize = async () => {
        const rowCount = Math.max(1, Math.min(50, tempRows));
        const colCount = Math.max(1, Math.min(50, tempCols));

        // Cleanup cells outside new boundaries
        const cleanedCells = { ...box.cells };
        Object.keys(cleanedCells).forEach(id => {
            const [r, c] = id.split('-').map(Number);
            if (r >= rowCount || c >= colCount) {
                delete cleanedCells[id];
            }
        });

        await onUpdate({
            ...box,
            rows: rowCount,
            cols: colCount,
            cells: cleanedCells
        });
        setIsResizing(false);
    };

    return (
        <div className="box-view-container">
            <div className="box-header">
                <button className="btn-icon" onClick={onBack}><ArrowLeft size={24} /></button>
                <div className="box-title-info">
                    <h3>{box.name}</h3>
                    <p>{box.rows}x{box.cols} Storage Matrix • {Object.keys(box.cells).length} Samples</p>
                </div>
                <div className="box-actions">
                    <button
                        className={`btn-secondary ${isResizing ? 'active' : ''}`}
                        onClick={() => setIsResizing(!isResizing)}
                    >
                        <Edit3 size={18} />
                        {isResizing ? 'Cancel Resize' : 'Resize Matrix'}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowQR(!showQR)}>
                        <Printer size={18} />
                        {showQR ? 'Show Grid' : 'Print Label'}
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(box.id)}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {isResizing && (
                <div className="resize-toolbar glass glow-emerald">
                    <div className="resize-inputs">
                        <div className="input-group">
                            <label>Rows</label>
                            <input
                                type="number"
                                value={tempRows}
                                onChange={e => setTempRows(parseInt(e.target.value) || 0)}
                                min="1"
                                max="50"
                            />
                        </div>
                        <div className="input-group">
                            <label>Columns</label>
                            <input
                                type="number"
                                value={tempCols}
                                onChange={e => setTempCols(parseInt(e.target.value) || 0)}
                                min="1"
                                max="50"
                            />
                        </div>
                    </div>
                    <div className="resize-info">
                        <p>Changes will be saved immediately. Samples outside the new grid will be deleted.</p>
                    </div>
                    <button className="btn-primary" onClick={handleResize}>
                        <Save size={18} />
                        Apply Dimensions
                    </button>
                </div>
            )}

            <div className="box-content-layout">
                <div className="grid-section">
                    {showQR ? (
                        <QRCodeLabel box={box} />
                    ) : (
                        <>
                            <GridSystem
                                box={box}
                                onCellClick={handleCellClick}
                                selectedCell={selectedCell || undefined}
                            />

                            <div className="box-inventory-summary glass">
                                <h4>Content Registry</h4>
                                <div className="inventory-list-scroll">
                                    {Object.entries(box.cells).length > 0 ? (
                                        <div className="inventory-summary-list">
                                            {Object.entries(box.cells)
                                                .sort(([idA], [idB]) => idA.localeCompare(idB))
                                                .map(([id, cell]) => {
                                                    const [r, c] = id.split('-').map(Number);
                                                    return (
                                                        <div
                                                            key={id}
                                                            className={`inventory-item ${cell.type}`}
                                                            onClick={() => handleCellClick(r, c)}
                                                        >
                                                            <div className="item-coord">{String.fromCharCode(65 + r)}{c + 1}</div>
                                                            <div className="item-meta">
                                                                <span className="item-type">{cell.type}</span>
                                                                <span className="item-name">{cell.name || 'Unnamed Sample'}</span>
                                                                <span className="item-content">{cell.content || ''}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="empty-hint">No samples registered in this unit.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="details-panel glass">
                    {selectedCell ? (
                        <div className="cell-editor">
                            <div className="editor-header">
                                <h4>Cell {String.fromCharCode(65 + selectedCell.row)}{selectedCell.col + 1}</h4>
                                <span className="coordinate-tag">{selectedCell.row}:{selectedCell.col}</span>
                            </div>

                            <div className="editor-body">
                                <div className="form-group">
                                    <label>Sample Name</label>
                                    <input
                                        type="text"
                                        value={cellEditData.name || ''}
                                        onChange={e => setCellEditData({ ...cellEditData, name: e.target.value })}
                                        placeholder="Enter name (e.g. GFP-1)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        value={cellEditData.content}
                                        onChange={e => setCellEditData({ ...cellEditData, content: e.target.value })}
                                        placeholder="Describe the content..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={cellEditData.type}
                                        onChange={e => setCellEditData({ ...cellEditData, type: e.target.value as any })}
                                    >
                                        <option value="empty">Empty</option>
                                        <option value="sample">Biological Sample</option>
                                        <option value="control">Control Group</option>
                                        <option value="primers">Primers</option>
                                        <option value="plasmid">Plasmid</option>
                                        <option value="antibody">Antibody</option>
                                        <option value="reagent">Reagent</option>
                                    </select>
                                </div>
                                <div className="editor-actions">
                                    <button className="btn-secondary" onClick={clearCell}>Clear Cell</button>
                                    <button className="btn-primary" onClick={saveCellData}>
                                        <Save size={16} />
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-selection">
                            <Edit3 size={40} opacity={0.2} />
                            <p>Select a cell to view or edit its contents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
