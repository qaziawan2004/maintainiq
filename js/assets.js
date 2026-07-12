 
// Asset management for MaintainIQ

const Assets = {
    currentEditingId: null,
    
    // Initialize assets module
    init() {
        this.renderAssets();
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Add asset button
        document.getElementById('addAssetBtn').addEventListener('click', () => {
            this.openModal();
        });
        
        // Asset form submit
        document.getElementById('assetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAsset();
        });
        
        // Search
        document.getElementById('assetSearch').addEventListener('input', Utils.debounce(() => {
            this.renderAssets();
        }, 300));
        
        // Filter
        document.getElementById('assetFilter').addEventListener('change', () => {
            this.renderAssets();
        });
    },
    
    // Open modal
    openModal(asset = null) {
        const modal = document.getElementById('assetModal');
        const title = document.getElementById('assetModalTitle');
        const form = document.getElementById('assetForm');
        
        if (asset) {
            title.textContent = 'Edit Asset';
            this.currentEditingId = asset.id;
            document.getElementById('assetName').value = asset.name;
            document.getElementById('assetCode').value = asset.code;
            document.getElementById('assetCategory').value = asset.category;
            document.getElementById('assetLocation').value = asset.location || '';
            document.getElementById('assetDescription').value = asset.description || '';
            document.getElementById('assetStatus').value = asset.status;
        } else {
            title.textContent = 'Add Asset';
            this.currentEditingId = null;
            form.reset();
        }
        
        modal.classList.add('active');
    },
    
    // Close modal
    closeModal() {
        document.getElementById('assetModal').classList.remove('active');
        document.getElementById('assetForm').reset();
        this.currentEditingId = null;
    },
    
    // Save asset
    saveAsset() {
        const name = document.getElementById('assetName').value.trim();
        const code = document.getElementById('assetCode').value.trim().toUpperCase();
        const category = document.getElementById('assetCategory').value;
        const location = document.getElementById('assetLocation').value.trim();
        const description = document.getElementById('assetDescription').value.trim();
        const status = document.getElementById('assetStatus').value;
        
        // Validate
        if (!name || !code) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const assets = Storage.getAssets();
        
        // Check duplicate code (excluding current edit)
        const duplicate = assets.find(a => a.code === code && a.id !== this.currentEditingId);
        if (duplicate) {
            Utils.showToast('Asset code already exists. Please use a unique code.', 'error');
            return;
        }
        
        if (this.currentEditingId) {
            // Update existing
            const index = assets.findIndex(a => a.id === this.currentEditingId);
            if (index !== -1) {
                assets[index] = {
                    ...assets[index],
                    name,
                    code,
                    category,
                    location,
                    description,
                    status,
                    updatedAt: new Date().toISOString()
                };
                Storage.setAssets(assets);
                Utils.showToast('Asset updated successfully!', 'success');
                Notifications.notifyAssetUpdated(assets[index]);
                Storage.addHistory({
                    type: 'asset_updated',
                    assetId: assets[index].id,
                    message: `Asset "${name}" was updated`,
                    data: assets[index]
                });
            }
        } else {
            // Create new
            const newAsset = {
                id: Utils.generateId(),
                name,
                code,
                category,
                location,
                description,
                status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            assets.push(newAsset);
            Storage.setAssets(assets);
            
            // Add to history
            Storage.addHistory({
                type: 'asset_created',
                assetId: newAsset.id,
                message: `Asset "${newAsset.name}" was created`,
                data: newAsset
            });
            
            Utils.showToast('Asset created successfully!', 'success');
            Notifications.notifyAssetCreated(newAsset);
        }
        
        this.closeModal();
        this.renderAssets();
        Analytics.updateStats();
    },
    
    // Delete asset
    deleteAsset(id) {
        if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            return;
        }
        
        let assets = Storage.getAssets();
        const asset = assets.find(a => a.id === id);
        assets = assets.filter(a => a.id !== id);
        Storage.setAssets(assets);
        
        // Remove associated issues
        let issues = Storage.getIssues();
        issues = issues.filter(i => i.assetId !== id);
        Storage.setIssues(issues);
        
        // Remove associated maintenance
        let maintenance = Storage.getMaintenance();
        maintenance = maintenance.filter(m => m.assetId !== id);
        Storage.setMaintenance(maintenance);
        
        Storage.addHistory({
            type: 'asset_deleted',
            assetId: id,
            message: `Asset "${asset?.name || 'Unknown'}" was deleted`,
            data: { assetId: id }
        });
        
        Utils.showToast('Asset deleted successfully!', 'success');
        this.renderAssets();
        Analytics.updateStats();
    },
    
    // Render assets
    renderAssets() {
        const container = document.getElementById('assetsGrid');
        if (!container) return;
        
        const assets = Storage.getAssets();
        const search = document.getElementById('assetSearch').value.toLowerCase();
        const filter = document.getElementById('assetFilter').value;
        
        let filtered = assets;
        
        // Search filter
        if (search) {
            filtered = filtered.filter(a => 
                a.name.toLowerCase().includes(search) ||
                a.code.toLowerCase().includes(search) ||
                a.category.toLowerCase().includes(search) ||
                (a.location && a.location.toLowerCase().includes(search))
            );
        }
        
        // Status filter
        if (filter !== 'all') {
            filtered = filtered.filter(a => a.status === filter);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-boxes" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <p>No assets found</p>
                    <button class="btn-primary" onclick="Assets.openModal()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Add Asset
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(asset => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <div>
                        <h3>${asset.name}</h3>
                        <span class="asset-code">${asset.code}</span>
                    </div>
                    <span class="asset-status ${asset.status}">${asset.status}</span>
                </div>
                <div class="asset-card-body">
                    <p><i class="fas fa-tag"></i> ${asset.category}</p>
                    ${asset.location ? `<p><i class="fas fa-map-marker-alt"></i> ${asset.location}</p>` : ''}
                    ${asset.description ? `<p style="margin-top: 0.5rem; color: var(--gray);">${Utils.truncate(asset.description, 80)}</p>` : ''}
                    <p style="font-size: 0.8rem; color: var(--gray); margin-top: 0.5rem;">
                        Created: ${Utils.formatDate(asset.createdAt)}
                    </p>
                </div>
                <div class="asset-card-actions">
                    <button class="btn-secondary btn-sm" onclick="AssetDetail.viewAsset('${asset.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-secondary btn-sm" onclick="Assets.openModal(Assets.getAsset('${asset.id}'))">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger btn-sm" onclick="Assets.deleteAsset('${asset.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Get asset by ID
    getAsset(id) {
        const assets = Storage.getAssets();
        return assets.find(a => a.id === id);
    }
};

// Export for browser
window.Assets = Assets;