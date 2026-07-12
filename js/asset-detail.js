 
// Asset Detail view for MaintainIQ

const AssetDetail = {
    // View asset details
    viewAsset(id) {
        const asset = Assets.getAsset(id);
        if (!asset) {
            Utils.showToast('Asset not found', 'error');
            return;
        }
        
        const modal = document.getElementById('assetDetailModal');
        const title = document.getElementById('assetDetailTitle');
        const content = document.getElementById('assetDetailContent');
        
        title.textContent = asset.name;
        
        const issues = Storage.getIssues().filter(i => i.assetId === id);
        const maintenance = Storage.getMaintenance().filter(m => m.assetId === id);
        const history = Storage.getHistory().filter(h => h.assetId === id);
        
        content.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <!-- Basic Info -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div><strong>Code:</strong> ${asset.code}</div>
                    <div><strong>Category:</strong> ${asset.category}</div>
                    <div><strong>Status:</strong> <span class="asset-status ${asset.status}">${asset.status}</span></div>
                    <div><strong>Location:</strong> ${asset.location || 'N/A'}</div>
                    <div><strong>Created:</strong> ${Utils.formatDate(asset.createdAt)}</div>
                    <div><strong>Updated:</strong> ${Utils.formatDate(asset.updatedAt)}</div>
                </div>
                
                ${asset.description ? `<div><strong>Description:</strong><p style="margin-top: 0.5rem;">${asset.description}</p></div>` : ''}
                
                <!-- QR Code -->
                <div>
                    <h4>QR Code & Public Page</h4>
                    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: center; margin-top: 0.5rem;">
                        <div class="qr-container">
                            <div id="assetQR"></div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                                <button class="btn-secondary btn-sm" onclick="QR.downloadQR(document.getElementById('assetQR'), '${asset.code}.png')">
                                    <i class="fas fa-download"></i> Download QR
                                </button>
                                <button class="btn-secondary btn-sm" onclick="window.open('public-asset.html?id=${asset.id}', '_blank')">
                                    <i class="fas fa-external-link-alt"></i> Open Public Page
                                </button>
                            </div>
                        </div>
                        <div>
                            <p style="font-size: 0.9rem; color: var(--gray);">Public URL:</p>
                            <code style="background: var(--light-gray); padding: 0.5rem; border-radius: 4px; display: block; word-break: break-all;">
                                ${window.location.origin}/public-asset.html?id=${asset.id}
                            </code>
                        </div>
                    </div>
                </div>
                
                <!-- Issues -->
                <div>
                    <h4>Issues (${issues.length})</h4>
                    ${issues.length === 0 ? '<p class="empty-state">No issues reported</p>' : 
                        issues.map(i => `
                            <div style="padding: 0.75rem; border-bottom: 1px solid var(--light-gray); cursor: pointer;" onclick="IssueDetail.viewIssue('${i.id}')">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                                    <div>
                                        <strong>${i.title}</strong>
                                        <span class="badge-priority ${i.priority}">${i.priority}</span>
                                        <span class="asset-status ${i.status}">${i.status}</span>
                                    </div>
                                    <span style="font-size: 0.8rem; color: var(--gray);">${Utils.formatDate(i.reportedAt)}</span>
                                </div>
                                <div style="font-size: 0.9rem; color: var(--gray); margin-top: 0.25rem;">${Utils.truncate(i.description, 100)}</div>
                            </div>
                        `).join('')
                    }
                </div>
                
                <!-- Maintenance Records -->
                <div>
                    <h4>Maintenance Records (${maintenance.length})</h4>
                    ${maintenance.length === 0 ? '<p class="empty-state">No maintenance records</p>' :
                        maintenance.map(m => `
                            <div style="padding: 0.75rem; border-bottom: 1px solid var(--light-gray);">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                                    <div>
                                        <strong>${m.title}</strong>
                                        <span class="status ${m.status}">${m.status}</span>
                                    </div>
                                    <span style="font-size: 0.8rem; color: var(--gray);">Scheduled: ${Utils.formatDate(m.scheduledDate)}</span>
                                </div>
                                ${m.assignedTo ? `<div style="font-size: 0.9rem; color: var(--gray);">Assigned to: ${m.assignedTo}</div>` : ''}
                            </div>
                        `).join('')
                    }
                </div>
                
                <!-- History -->
                <div>
                    <h4>Activity History (${history.length})</h4>
                    ${history.length === 0 ? '<p class="empty-state">No activity recorded</p>' :
                        history.slice(0, 10).map(h => `
                            <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--light-gray);">
                                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                                    <span>${h.message}</span>
                                    <span style="font-size: 0.8rem; color: var(--gray);">${Utils.formatDate(h.timestamp)}</span>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        
        // Generate QR code after modal is shown
        setTimeout(() => {
            const qrElement = document.getElementById('assetQR');
            if (qrElement) {
                QR.generateAssetQR(qrElement, asset);
            }
        }, 100);
    }
};

// Export for browser
window.AssetDetail = AssetDetail;