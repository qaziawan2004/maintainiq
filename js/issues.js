// Issue management for MaintainIQ

const Issues = {
    currentEditingId: null,
    
    // Initialize issues module
    init() {
        this.renderIssues();
        this.populateAssetSelect();
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Report issue button
        document.getElementById('reportIssueBtn').addEventListener('click', () => {
            this.openModal();
        });
        
        // Issue form submit
        document.getElementById('issueForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIssue();
        });
        
        // Search
        document.getElementById('issueSearch').addEventListener('input', Utils.debounce(() => {
            this.renderIssues();
        }, 300));
        
        // Filter
        document.getElementById('issueFilter').addEventListener('change', () => {
            this.renderIssues();
        });
    },
    
    // Populate asset select
    populateAssetSelect() {
        const select = document.getElementById('issueAsset');
        const assets = Storage.getAssets();
        
        select.innerHTML = '<option value="">Select an asset</option>';
        assets.forEach(asset => {
            select.innerHTML += `<option value="${asset.id}">${asset.name} (${asset.code})</option>`;
        });
    },
    
    // Open modal
    openModal(issue = null) {
        const modal = document.getElementById('issueModal');
        const title = document.getElementById('issueModalTitle');
        const form = document.getElementById('issueForm');
        
        this.populateAssetSelect();
        
        if (issue) {
            title.textContent = 'Edit Issue';
            this.currentEditingId = issue.id;
            document.getElementById('issueAsset').value = issue.assetId;
            document.getElementById('issueTitle').value = issue.title;
            document.getElementById('issueDescription').value = issue.description;
            document.getElementById('issuePriority').value = issue.priority;
            document.getElementById('issueStatus').value = issue.status;
        } else {
            title.textContent = 'Report Issue';
            this.currentEditingId = null;
            form.reset();
            document.getElementById('issueStatus').value = 'reported';
        }
        
        modal.classList.add('active');
    },
    
    // Close modal
    closeModal() {
        document.getElementById('issueModal').classList.remove('active');
        document.getElementById('issueForm').reset();
        this.currentEditingId = null;
    },
    
    // Save issue
    saveIssue() {
        const assetId = document.getElementById('issueAsset').value;
        const title = document.getElementById('issueTitle').value.trim();
        const description = document.getElementById('issueDescription').value.trim();
        const priority = document.getElementById('issuePriority').value;
        const status = document.getElementById('issueStatus').value;
        const evidenceFile = document.getElementById('issueEvidence').files[0];
        
        // Validate
        if (!assetId || !title || !description) {
            Utils.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const asset = Assets.getAsset(assetId);
        if (!asset) {
            Utils.showToast('Selected asset not found', 'error');
            return;
        }
        
        const issues = Storage.getIssues();
        const user = Auth.getCurrentUser();
        
        // Handle evidence
        let evidence = null;
        if (evidenceFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                evidence = e.target.result;
                saveIssueData(evidence);
            };
            reader.readAsDataURL(evidenceFile);
        } else {
            saveIssueData(null);
        }
        
        const saveIssueData = (evidenceData) => {
            if (this.currentEditingId) {
                // Update existing
                const index = issues.findIndex(i => i.id === this.currentEditingId);
                if (index !== -1) {
                    issues[index] = {
                        ...issues[index],
                        assetId,
                        title,
                        description,
                        priority,
                        status,
                        evidence: evidenceData || issues[index].evidence,
                        updatedAt: new Date().toISOString()
                    };
                    Storage.setIssues(issues);
                    Utils.showToast('Issue updated successfully!', 'success');
                    Notifications.notifyIssueUpdated(issues[index]);
                    
                    Storage.addHistory({
                        type: 'issue_updated',
                        assetId: assetId,
                        message: `Issue "${title}" was updated`,
                        data: issues[index]
                    });
                }
            } else {
                // Create new
                const newIssue = {
                    id: Utils.generateId(),
                    assetId,
                    title,
                    description,
                    priority,
                    status,
                    reportedBy: user?.name || 'Anonymous',
                    reportedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    evidence: evidenceData,
                    notes: []
                };
                
                issues.push(newIssue);
                Storage.setIssues(issues);
                
                // Add to history
                Storage.addHistory({
                    type: 'issue_reported',
                    assetId: assetId,
                    message: `Issue "${title}" was reported for ${asset.name}`,
                    data: newIssue
                });
                
                Utils.showToast('Issue reported successfully!', 'success');
                Notifications.notifyIssueReported(newIssue, asset);
            }
            
            this.closeModal();
            this.renderIssues();
            Analytics.updateStats();
        };
    },
    
    // Update issue status
    updateStatus(id, newStatus) {
        const issues = Storage.getIssues();
        const issue = issues.find(i => i.id === id);
        
        if (!issue) {
            Utils.showToast('Issue not found', 'error');
            return;
        }
        
        const oldStatus = issue.status;
        issue.status = newStatus;
        issue.updatedAt = new Date().toISOString();
        
        Storage.setIssues(issues);
        
        Storage.addHistory({
            type: 'issue_updated',
            assetId: issue.assetId,
            message: `Issue "${issue.title}" status changed from ${oldStatus} to ${newStatus}`,
            data: { issueId: id, oldStatus, newStatus }
        });
        
        Utils.showToast(`Issue status updated to ${newStatus}`, 'success');
        this.renderIssues();
        Analytics.updateStats();
    },
    
    // Add note to issue
    addNote(id, note, author = 'Technician') {
        const issues = Storage.getIssues();
        const issue = issues.find(i => i.id === id);
        
        if (!issue) {
            Utils.showToast('Issue not found', 'error');
            return;
        }
        
        if (!issue.notes) {
            issue.notes = [];
        }
        
        issue.notes.push({
            text: note,
            author: author,
            timestamp: new Date().toISOString()
        });
        
        issue.updatedAt = new Date().toISOString();
        Storage.setIssues(issues);
        
        Storage.addHistory({
            type: 'issue_updated',
            assetId: issue.assetId,
            message: `Note added to issue "${issue.title}"`,
            data: { issueId: id, note, author }
        });
        
        Utils.showToast('Note added successfully!', 'success');
        this.renderIssues();
    },
    
    // Add note prompt
    addNotePrompt(id) {
        const note = prompt('Enter your note:');
        if (note && note.trim()) {
            const user = Auth.getCurrentUser();
            this.addNote(id, note.trim(), user?.name || 'Technician');
        }
    },
    
    // Resolve issue
    resolveIssue(id, resolutionNote = '') {
        this.updateStatus(id, 'resolved');
        if (resolutionNote) {
            this.addNote(id, `Resolved: ${resolutionNote}`, 'Technician');
        }
        
        Storage.addHistory({
            type: 'issue_resolved',
            assetId: Storage.getIssues().find(i => i.id === id)?.assetId,
            message: `Issue was resolved`,
            data: { issueId: id }
        });
    },
    
    // Delete issue
    deleteIssue(id) {
        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }
        
        let issues = Storage.getIssues();
        const issue = issues.find(i => i.id === id);
        issues = issues.filter(i => i.id !== id);
        Storage.setIssues(issues);
        
        Storage.addHistory({
            type: 'issue_deleted',
            assetId: issue?.assetId,
            message: `Issue "${issue?.title}" was deleted`,
            data: { issueId: id }
        });
        
        Utils.showToast('Issue deleted successfully!', 'success');
        this.renderIssues();
        Analytics.updateStats();
    },
    
    // Render issues
    renderIssues() {
        const container = document.getElementById('issuesList');
        if (!container) return;
        
        const issues = Storage.getIssues();
        const assets = Storage.getAssets();
        const search = document.getElementById('issueSearch').value.toLowerCase();
        const filter = document.getElementById('issueFilter').value;
        
        let filtered = issues;
        
        // Search
        if (search) {
            filtered = filtered.filter(i => 
                i.title.toLowerCase().includes(search) ||
                i.description.toLowerCase().includes(search) ||
                (assets.find(a => a.id === i.assetId)?.name || '').toLowerCase().includes(search)
            );
        }
        
        // Status filter
        if (filter !== 'all') {
            filtered = filtered.filter(i => i.status === filter);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <p>No issues found</p>
                    <button class="btn-primary" onclick="Issues.openModal()" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Report Issue
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(issue => {
            const asset = assets.find(a => a.id === issue.assetId);
            
            return `
                <div class="issue-item priority-${issue.priority}" onclick="IssueDetail.viewIssue('${issue.id}')" style="cursor: pointer;">
                    <div class="issue-header">
                        <div>
                            <h3>${issue.title}</h3>
                            <div class="issue-meta">
                                <span><i class="fas fa-box"></i> ${asset?.name || 'Unknown Asset'}</span>
                                <span><i class="fas fa-tag"></i> ${Utils.getPriorityLabel(issue.priority)}</span>
                                <span><i class="fas fa-clock"></i> ${Utils.formatDate(issue.reportedAt)}</span>
                                <span style="color: ${Utils.getStatusColor(issue.status)};">
                                    <i class="fas fa-circle"></i> ${Utils.capitalize(issue.status)}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-secondary btn-sm" onclick="event.stopPropagation(); Issues.openModal(Issues.getIssue('${issue.id}'))">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="event.stopPropagation(); Issues.deleteIssue('${issue.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="issue-body">
                        ${Utils.truncate(issue.description, 150)}
                    </div>
                    ${issue.notes && issue.notes.length > 0 ? `
                        <div style="font-size: 0.8rem; color: var(--gray); margin: 0.5rem 0;">
                            <i class="fas fa-comment"></i> ${issue.notes.length} notes
                        </div>
                    ` : ''}
                    <div class="issue-actions" onclick="event.stopPropagation();">
                        ${issue.status === 'reported' ? `
                            <button class="btn-success btn-sm" onclick="Issues.updateStatus('${issue.id}', 'in-progress')">
                                <i class="fas fa-play"></i> Start
                            </button>
                        ` : ''}
                        ${issue.status === 'in-progress' ? `
                            <button class="btn-success btn-sm" onclick="Issues.resolveIssue('${issue.id}')">
                                <i class="fas fa-check"></i> Resolve
                            </button>
                        ` : ''}
                        ${issue.status !== 'resolved' && issue.status !== 'closed' ? `
                            <button class="btn-secondary btn-sm" onclick="Issues.addNotePrompt('${issue.id}')">
                                <i class="fas fa-comment"></i> Add Note
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Get issue by ID
    getIssue(id) {
        const issues = Storage.getIssues();
        return issues.find(i => i.id === id);
    }
};

// Export for browser
window.Issues = Issues;