import { useState, useEffect } from 'react';
import { Layout, Grid as GridIcon, Package, Plus, Settings, Search, Trash2, Calendar } from 'lucide-react';
import type { Box } from './lib/storage';
import { storage } from './lib/storage';
import { NewBoxModal } from './components/NewBoxModal';
import { BoxView } from './components/BoxView';
import confetti from 'canvas-confetti';
import './App.css';
import './components/Modal.css';
import './components/BoxView.css';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory'>('dashboard');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [showNewBoxModal, setShowNewBoxModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initApp = async () => {
      await storage.migrateIfNeeded();
      const loadedBoxes = await storage.getBoxes();
      setBoxes(loadedBoxes);
    };
    initApp();
  }, []);

  const handleSaveBox = async (box: Box) => {
    await storage.saveBox(box);
    const updatedBoxes = await storage.getBoxes();
    setBoxes(updatedBoxes);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#ffffff']
    });
  };

  const handleDeleteBox = async (id: string) => {
    if (confirm('Are you sure you want to delete this storage box?')) {
      await storage.deleteBox(id);
      const updatedBoxes = await storage.getBoxes();
      setBoxes(updatedBoxes);
      setActiveBoxId(null);
    }
  };

  const handleUpdateBox = async (box: Box) => {
    await storage.saveBox(box);
    const updatedBoxes = await storage.getBoxes();
    setBoxes(updatedBoxes);
  };

  const filteredBoxes = boxes.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBox = boxes.find(b => b.id === activeBoxId);

  return (
    <div className="app-container">
      <nav className="sidebar glass">
        <div className="logo-container">
          <div className="logo-icon glow-emerald">
            <Package size={24} color="var(--accent-emerald)" />
          </div>
          <h1>BIO<span>LAB</span></h1>
        </div>

        <div className="nav-links">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setActiveBoxId(null);
            }}
          >
            <Layout size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <GridIcon size={20} />
            <span>Inventory</span>
          </button>
          <button
            className="nav-item"
            onClick={() => setShowNewBoxModal(true)}
          >
            <Plus size={20} />
            <span>Create New Box</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="version-tag">SYSTEM v1.0.4</div>
          <button className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header glass">
          <div className="header-info">
            <h2>{activeBox ? activeBox.name : activeTab === 'dashboard' ? 'Laboratory Overview' : 'Box Inventory'}</h2>
            <p className="status-text"><span className="status-dot"></span> Secure Storage Active</p>
          </div>
          <div className="header-actions">
            {!activeBox && (
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Filter boxes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <button className="btn-primary glow-emerald" onClick={() => setShowNewBoxModal(true)}>
              <Plus size={18} />
              New Box
            </button>
          </div>
        </header>

        <section className="view-content">
          {activeBox ? (
            <BoxView
              box={activeBox}
              onBack={() => setActiveBoxId(null)}
              onUpdate={handleUpdateBox}
              onDelete={handleDeleteBox}
            />
          ) : activeTab === 'dashboard' ? (
            <div className="dashboard-layout">
              <div className="stats-row">
                <div className="card glass">
                  <div className="card-header">
                    <Package size={20} color="var(--accent-cyan)" />
                    <h3>Storage Boxes</h3>
                  </div>
                  <div className="stat-value">{boxes.length}</div>
                </div>
                <div className="card glass">
                  <div className="card-header">
                    <GridIcon size={20} color="var(--accent-emerald)" />
                    <h3>Total Slots</h3>
                  </div>
                  <div className="stat-value">
                    {boxes.reduce((acc, b) => acc + (b.rows * b.cols), 0).toLocaleString()}
                  </div>
                </div>
                <div className="card glass">
                  <div className="card-header">
                    <Calendar size={20} color="#a855f7" />
                    <h3>Active Samples</h3>
                  </div>
                  <div className="stat-value">
                    {boxes.reduce((acc, b) => acc + Object.keys(b.cells).length, 0)}
                  </div>
                </div>
              </div>

              <div className="recent-activity section">
                <h3>Recent Storage Units</h3>
                <div className="boxes-grid">
                  {boxes.slice(0, 4).map(box => (
                    <div key={box.id} className="box-card glass" onClick={() => setActiveBoxId(box.id)}>
                      <div className="box-card-icon">
                        <GridIcon size={24} color="var(--accent-cyan)" />
                      </div>
                      <div className="box-card-content">
                        <h4>{box.name}</h4>
                        <p>{box.rows}x{box.cols} • {Object.keys(box.cells).length} items</p>
                      </div>
                    </div>
                  ))}
                  <div className="box-card glass add-new" onClick={() => setShowNewBoxModal(true)}>
                    <Plus size={32} opacity={0.3} />
                    <p>Register New Unit</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="inventory-view">
              <div className="boxes-table glass">
                <div className="table-header">
                  <div className="col">Name</div>
                  <div className="col">Dimensions</div>
                  <div className="col">Samples</div>
                  <div className="col">Created</div>
                  <div className="col actions"></div>
                </div>
                {filteredBoxes.map(box => (
                  <div key={box.id} className="table-row" onClick={() => setActiveBoxId(box.id)}>
                    <div className="col name">
                      <Package size={16} />
                      {box.name}
                    </div>
                    <div className="col">{box.rows}x{box.cols}</div>
                    <div className="col">{Object.keys(box.cells).length}</div>
                    <div className="col text-dim">{new Date(box.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div className="col actions">
                      <button className="btn-icon-small" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBox(box.id);
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {showNewBoxModal && (
        <NewBoxModal
          onClose={() => setShowNewBoxModal(false)}
          onSave={handleSaveBox}
        />
      )}
    </div>
  );
}

export default App;
