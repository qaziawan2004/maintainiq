 
// History management for MaintainIQ

const History = {
    // Initialize history module
    init() {
        this.renderHistory();
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        document.getElementById('historySearch').addEventListener('input', Utils.debounce(() => {
            this.renderHistory();
        }, 300));
        
        document.getElementById('historyFilter').addEventListener('change', () => {
            this.renderHistory();
        });
    },
    
    // Render history
    renderHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;
        
        let history = Storage.getHistory();
        const search = document.getElementById('historySearch').value.toLowerCase();
        const filter = document.getElementById('historyFilter').value;
        
        // Filter by type
        if (filter !== 'all') {
            history = history.filter(h => h.type === filter);
        }
        
        // Search
        if (search) {
            history = history.filter(h => 
                h.message.toLowerCase().includes(search) ||
                h.type.toLowerCase().includes(search)
            );
        }
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <p>No history entries found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = history.map(h => `
            <div class="history-item">
                <div>
                    <span class="history-type ${h.type}">${h.type.replace('_', ' ').toUpperCase()}</span>
                    <span style="margin-left: 0.5rem;">${h.message}</span>
                </div>
                <div class="history-time">${Utils.formatDate(h.timestamp)}</div>
            </div>
        `).join('');
    }
};

// Export for browser
window.History = History;