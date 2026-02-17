import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Package, Tag, ArrowRight } from 'lucide-react';
import type { Box } from '../lib/storage';
import './GlobalSearch.css';

interface SearchResult {
    type: 'box' | 'sample';
    boxId: string;
    boxName: string;
    cellId?: string;
    cellName?: string;
    cellType?: string;
    coordinate?: string;
    matches: string[];
}

interface GlobalSearchProps {
    boxes: Box[];
    onSelectResult: (boxId: string, cellId?: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ boxes, onSelectResult }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const results = useMemo(() => {
        if (!query.trim() || query.length < 2) return [];

        const normalizedQuery = query.toLowerCase();
        const foundResults: SearchResult[] = [];

        boxes.forEach(box => {
            // Check box name/description
            if (box.name.toLowerCase().includes(normalizedQuery) ||
                (box.description && box.description.toLowerCase().includes(normalizedQuery))) {
                foundResults.push({
                    type: 'box',
                    boxId: box.id,
                    boxName: box.name,
                    matches: [box.name]
                });
            }

            // Check cells
            Object.entries(box.cells).forEach(([cellId, cell]) => {
                const matches: string[] = [];
                if (cell.name.toLowerCase().includes(normalizedQuery)) matches.push(cell.name);
                if (cell.content.toLowerCase().includes(normalizedQuery)) matches.push(cell.content);
                if (cell.type.toLowerCase().includes(normalizedQuery)) matches.push(cell.type);

                if (matches.length > 0) {
                    const [r, c] = cellId.split('-').map(Number);
                    foundResults.push({
                        type: 'sample',
                        boxId: box.id,
                        boxName: box.name,
                        cellId,
                        cellName: cell.name || 'Unnamed Sample',
                        cellType: cell.type,
                        coordinate: `${String.fromCharCode(65 + r)}${c + 1}`,
                        matches
                    });
                }
            });
        });

        return foundResults.slice(0, 10); // Limit to top 10 results
    }, [boxes, query]);

    return (
        <div className="global-search-container" ref={searchRef}>
            <div className={`search-input-wrapper glass ${isOpen ? 'active' : ''}`}>
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search samples, boxes, or keywords..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button className="clear-btn" onClick={() => setQuery('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && query.length >= 2 && (
                <div className="search-results-dropdown glass glow-emerald">
                    {results.length > 0 ? (
                        <div className="results-list">
                            {results.map((result, index) => (
                                <div
                                    key={`${result.boxId}-${result.cellId || 'box'}-${index}`}
                                    className="result-item"
                                    onClick={() => {
                                        onSelectResult(result.boxId, result.cellId);
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <div className="result-icon">
                                        {result.type === 'box' ? <Package size={16} /> : <Tag size={16} />}
                                    </div>
                                    <div className="result-content">
                                        <div className="result-title">
                                            {result.type === 'box' ? result.boxName : result.cellName}
                                            {result.coordinate && <span className="result-coord">{result.coordinate}</span>}
                                        </div>
                                        <div className="result-sub">
                                            {result.type === 'sample' ? `In ${result.boxName}` : 'Storage Unit'}
                                            {result.cellType && <span className={`type-tag ${result.cellType}`}>{result.cellType}</span>}
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="jump-icon" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>No matches found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
