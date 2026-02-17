import { useMemo } from 'react';
import type { Box } from '../lib/storage';
import { motion } from 'framer-motion';

interface GridSystemProps {
    box: Box;
    onCellClick: (row: number, col: number) => void;
    selectedCell?: { row: number; col: number };
}

export const GridSystem: React.FC<GridSystemProps> = ({ box, onCellClick, selectedCell }) => {
    const gridCells = useMemo(() => {
        const cells = [];
        for (let r = 0; r < box.rows; r++) {
            for (let c = 0; c < box.cols; c++) {
                const cellId = `${r}-${c}`;
                const cellData = box.cells[cellId];
                cells.push({
                    row: r,
                    col: c,
                    data: cellData
                });
            }
        }
        return cells;
    }, [box]);

    return (
        <div className="grid-wrapper glass">
            <div
                className="grid-container"
                style={{
                    gridTemplateColumns: `repeat(${box.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${box.rows}, 1fr)`,
                    aspectRatio: `${box.cols} / ${box.rows}`
                }}
            >
                {gridCells.map(({ row, col, data }) => {
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                    return (
                        <motion.div
                            key={`${row}-${col}`}
                            className={`grid-cell ${data ? data.type : 'empty'} ${isSelected ? 'selected' : ''}`}
                            whileHover={{ scale: 1.1, zIndex: 1 }}
                            onClick={() => onCellClick(row, col)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (row * box.cols + col) * 0.0001 }}
                        >
                            {data && (
                                <>
                                    <div className="cell-indicator" />
                                    {data.name && <div className="cell-name">{data.name}</div>}
                                </>
                            )}
                            <div className="cell-label">{String.fromCharCode(65 + row)}{col + 1}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
