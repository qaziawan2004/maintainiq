 
// Public Asset Page for MaintainIQ

document.addEventListener('DOMContentLoaded', function() {
    PublicAsset.init();
});

const PublicAsset = {
    init() {
        // Get asset ID from URL
        const params = new URLSearchParams(window.location.search);
        const assetId = params.get('id');
        
        if (assetId) {
            this.loadAsset(assetId);
        } else {
            this.showError('No asset specified');
        }
    },
    
    loadAsset(id) {
        const asset = Assets.getAsset(id);
        
        if (!asset) {
            this.showError('Asset not found');
            return;
        }
        
        const issues = Storage.getIssues().filter(i => i.assetId === id);
        const container = document.getElementById('publicAssetContent');
        
        container.innerHTML = `
            <div class="public-asset-card">
                <div class="public-asset-header">
                    <div>
                        <h2>${asset.name}</h2>
                        <p style="color: var(--gray);">${asset.code}</p>
                    </div>
                    <span class="asset-status ${asset.status}">${asset.status}</span>
                </div>
                
                <div class="public-asset-info">
                    <div class="info-item">
                        <label>Category</label>
                        <value>${asset.category}</value>
                    </div>
                    <div class="info-item">
                        <label>Location</label>
                        <value>${asset.location || 'N/A'}</value>
                    </div>
                    <div class="info-item">
                        <label>Description</label>
                        <value>${asset.description || 'No description provided'}</value>
                    </div>
                    <div class="info-item">
                        <label>Added</label>
                        <value>${Utils.formatDate(asset.createdAt)}</value>
                    </div>
                </div>
                
                <div class="public-issues-section">
                    <h3>Reported Issues (${issues.length})</h3>
                    ${issues.length === 0 ? '<p class="empty-state">No issues reported for this asset</p>' :
                        issues.map(issue => `
                            <div class="public-issue">
                                <div>
                                    <span class="issue-title">${issue.title}</span>
                                    <span class="issue-status" style="background: ${Utils.getStatusColor(issue.status)}20; color: ${Utils.getStatusColor(issue.status)};">
                                        ${issue.status}
                                    </span>
                                    <span class="badge-priority ${issue.priority}" style="float: right;">${issue.priority}</span>
                                </div>
                                <p style="font-size: 0.9rem; color: var(--gray); margin-top: 0.25rem;">${Utils.truncate(issue.description, 100)}</p>
                                <div style="font-size: 0.8rem; color: var(--gray); margin-top: 0.25rem;">
                                    Reported: ${Utils.formatDate(issue.reportedAt)}
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--light-gray); text-align: center;">
                    <p style="color: var(--gray); font-size: 0.9rem;">
                        <i class="fas fa-shield-alt"></i> 
                        This is a public asset page. To report an issue or manage this asset, please 
                        <a href="login.html" style="color: var(--primary); text-decoration: none; font-weight: 600;">login</a>.
                    </p>
                </div>
            </div>
        `;
    },
    
    showError(message) {
        const container = document.getElementById('publicAssetContent');
        container.innerHTML = `
            <div class="public-asset-card" style="text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--danger); margin-bottom: 1rem;"></i>
                <h2>${message}</h2>
                <p style="color: var(--gray); margin-top: 0.5rem;">The asset you're looking for might have been removed or the URL is incorrect.</p>
                <a href="login.html" class="btn-primary" style="margin-top: 1.5rem;">
                    <i class="fas fa-sign-in-alt"></i> Go to Login
                </a>
            </div>
        `;
    }
};

// Export for browser
window.PublicAsset = PublicAsset;