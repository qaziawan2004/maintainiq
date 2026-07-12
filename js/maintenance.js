 
// Maintenance management for MaintainIQ

const Maintenance = {
    // Initialize maintenance module
    init() {
        this.renderMaintenance();
    },
    
    // Render maintenance
    renderMaintenance() {
        const container = document.getElementById('maintenanceGrid');
        if (!container) return;
        
        const maintenance = Storage.getMaintenance();
        const assets = Storage.getAssets();
        
        if (maintenance.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-tools" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <p>No maintenance records found</p>
                    <p style="font-size: 0.9rem; color: var(--gray);">Maintenance tasks will appear here when scheduled</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = maintenance.map(m => {
            const asset = assets.find(a => a.id === m.assetId);
            return `
                <div class="maintenance-card">
                    <h4>${m.title}</h4>
                    <p style="color: var(--gray); font-size: 0.9rem;">${asset?.name || 'Unknown Asset'}</p>
                    <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.25rem;">${Utils.truncate(m.description, 80)}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <span class="status ${m.status}">${m.status}</span>
                        <span style="font-size: 0.8rem; color: var(--gray);">${Utils.formatDate(m.scheduledDate)}</span>
                    </div>
                    ${m.assignedTo ? `<div style="font-size: 0.8rem; color: var(--gray); margin-top: 0.25rem;">Assigned: ${m.assignedTo}</div>` : ''}
                </div>
            `;
        }).join('');
    }
};

// Export for browser
window.Maintenance = Maintenance;