 
// Issue Detail view for MaintainIQ

const IssueDetail = {
    // View issue details
    viewIssue(id) {
        const issue = Issues.getIssue(id);
        if (!issue) {
            Utils.showToast('Issue not found', 'error');
            return;
        }
        
        const asset = Assets.getAsset(issue.assetId);
        
        const modal = document.getElementById('issueDetailModal');
        const title = document.getElementById('issueDetailTitle');
        const content = document.getElementById('issueDetailContent');
        
        title.textContent = `Issue: ${issue.title}`;
        
        content.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                <!-- Basic Info -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div><strong>Asset:</strong> ${asset?.name || 'Unknown Asset'} (${asset?.code || 'N/A'})</div>
                    <div><strong>Priority:</strong> <span class="badge-priority ${issue.priority}">${issue.priority}</span></div>
                    <div><strong>Status:</strong> <span class="asset-status ${issue.status}">${issue.status}</span></div>
                    <div><strong>Reported By:</strong> ${issue.reportedBy || 'Anonymous'}</div>
                    <div><strong>Reported:</strong> ${Utils.formatDate(issue.reportedAt)}</div>
                    <div><strong>Updated:</strong> ${Utils.formatDate(issue.updatedAt)}</div>
                </div>
                
                <div>
                    <strong>Description:</strong>
                    <p style="margin-top: 0.5rem;">${issue.description}</p>
                </div>
                
                ${issue.evidence ? `
                    <div>
                        <strong>Evidence:</strong>
                        <div style="margin-top: 0.5rem;">
                            <img src="${issue.evidence}" alt="Evidence" style="max-width: 300px; max-height: 300px; border-radius: 8px; border: 1px solid var(--light-gray);" />
                        </div>
                    </div>
                ` : ''}
                
                <!-- Status Actions -->
                <div>
                    <h4>Actions</h4>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        ${issue.status === 'reported' ? `
                            <button class="btn-success" onclick="IssueDetail.updateIssueStatus('${issue.id}', 'in-progress')">
                                <i class="fas fa-play"></i> Start Progress
                            </button>
                        ` : ''}
                        ${issue.status === 'in-progress' ? `
                            <button class="btn-success" onclick="IssueDetail.resolveIssue('${issue.id}')">
                                <i class="fas fa-check"></i> Resolve Issue
                            </button>
                        ` : ''}
                        ${issue.status === 'resolved' ? `
                            <button class="btn-secondary" onclick="IssueDetail.updateIssueStatus('${issue.id}', 'closed')">
                                <i class="fas fa-times"></i> Close Issue
                            </button>
                        ` : ''}
                        <button class="btn-secondary" onclick="IssueDetail.addNote('${issue.id}')">
                            <i class="fas fa-comment"></i> Add Note
                        </button>
                        <button class="btn-secondary" onclick="Issues.openModal(Issues.getIssue('${issue.id}'))">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
                
                <!-- Notes -->
                <div>
                    <h4>Notes (${issue.notes?.length || 0})</h4>
                    ${!issue.notes || issue.notes.length === 0 ? '<p class="empty-state">No notes</p>' :
                        issue.notes.map(n => `
                            <div style="padding: 0.75rem; background: var(--light-gray); border-radius: 8px; margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <strong>${n.author || 'Anonymous'}</strong>
                                    <span style="font-size: 0.8rem; color: var(--gray);">${Utils.formatDate(n.timestamp)}</span>
                                </div>
                                <p style="margin-top: 0.25rem;">${n.text}</p>
                            </div>
                        `).join('')
                    }
                </div>
                
                <!-- History -->
                <div>
                    <h4>Activity History</h4>
                    ${Storage.getHistory().filter(h => h.data?.issueId === issue.id || h.message?.includes(issue.title)).slice(0, 10).map(h => `
                        <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--light-gray);">
                            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                                <span>${h.message}</span>
                                <span style="font-size: 0.8rem; color: var(--gray);">${Utils.formatDate(h.timestamp)}</span>
                            </div>
                        </div>
                    `).join('') || '<p class="empty-state">No history</p>'}
                </div>
                
                <!-- AI Triage -->
                <div>
                    <h4>AI Triage Suggestions</h4>
                    <div id="aiTriageContent">
                        <p class="empty-state">Loading AI suggestions...</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        
        // Load AI triage
        this.loadAITriage(issue);
    },
    
    // Update issue status
    updateIssueStatus(id, status) {
        Issues.updateStatus(id, status);
        this.viewIssue(id);
    },
    
    // Resolve issue with note
    resolveIssue(id) {
        const note = prompt('Enter resolution note (optional):');
        Issues.resolveIssue(id, note || '');
        this.viewIssue(id);
    },
    
    // Add note
    addNote(id) {
        Issues.addNotePrompt(id);
        setTimeout(() => this.viewIssue(id), 500);
    },
    
    // Load AI triage
    async loadAITriage(issue) {
        const container = document.getElementById('aiTriageContent');
        if (!container) return;
        
        try {
            const triage = await AI.triageIssue(issue);
            
            container.innerHTML = `
                <div style="padding: 1rem; background: var(--light-gray); border-radius: 8px;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">${triage.title}</p>
                    <ul style="list-style: none; padding: 0;">
                        ${triage.suggestions.map(s => `
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                                ${s}
                            </li>
                        `).join('')}
                    </ul>
                    <p style="margin-top: 0.5rem; color: var(--gray); font-size: 0.9rem;">
                        <i class="fas fa-clock"></i> Estimated resolution: ${triage.estimatedResolution}
                    </p>
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p class="empty-state">Unable to load AI suggestions</p>';
        }
    }
};

// Export for browser
window.IssueDetail = IssueDetail;