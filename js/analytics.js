// Analytics for MaintainIQ

const Analytics = {
    charts: {},
    
    // Initialize analytics
    init() {
        this.updateStats();
        this.renderCharts();
        this.renderTopAssets();
        this.renderRecentActivity();
    },
    
    // Update stats
    updateStats() {
        const assets = Storage.getAssets();
        const issues = Storage.getIssues();
        const maintenance = Storage.getMaintenance();
        
        document.getElementById('totalAssets').textContent = assets.length;
        document.getElementById('openIssues').textContent = issues.filter(i => i.status === 'reported' || i.status === 'in-progress').length;
        document.getElementById('resolvedIssues').textContent = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
        document.getElementById('pendingMaintenance').textContent = maintenance.filter(m => m.status === 'scheduled' || m.status === 'in-progress').length;
    },
    
    // Render charts
    renderCharts() {
        this.renderStatusChart();
        this.renderIssuesStatusChart();
        this.renderMaintenanceTrendChart();
    },
    
    // Status distribution chart
    renderStatusChart() {
        const canvas = document.getElementById('statusChart');
        if (!canvas) return;
        
        const assets = Storage.getAssets();
        const statusCount = {
            active: 0,
            maintenance: 0,
            retired: 0
        };
        
        assets.forEach(asset => {
            statusCount[asset.status] = (statusCount[asset.status] || 0) + 1;
        });
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.status) {
            this.charts.status.destroy();
        }
        
        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Maintenance', 'Retired'],
                datasets: [{
                    data: [statusCount.active, statusCount.maintenance, statusCount.retired],
                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    // Issues status chart
    renderIssuesStatusChart() {
        const canvas = document.getElementById('issuesStatusChart');
        if (!canvas) return;
        
        const issues = Storage.getIssues();
        const statusCount = {
            reported: 0,
            'in-progress': 0,
            resolved: 0,
            closed: 0
        };
        
        issues.forEach(issue => {
            statusCount[issue.status] = (statusCount[issue.status] || 0) + 1;
        });
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.issuesStatus) {
            this.charts.issuesStatus.destroy();
        }
        
        this.charts.issuesStatus = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Reported', 'In Progress', 'Resolved', 'Closed'],
                datasets: [{
                    label: 'Issues by Status',
                    data: [statusCount.reported, statusCount['in-progress'], statusCount.resolved, statusCount.closed],
                    backgroundColor: ['#f97316', '#3b82f6', '#22c55e', '#64748b'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    // Maintenance trend chart
    renderMaintenanceTrendChart() {
        const canvas = document.getElementById('maintenanceTrendChart');
        if (!canvas) return;
        
        const maintenance = Storage.getMaintenance();
        const last6Months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Get last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                month: monthNames[date.getMonth()],
                year: date.getFullYear(),
                count: 0
            });
        }
        
        maintenance.forEach(m => {
            const date = new Date(m.createdAt);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            
            const entry = last6Months.find(m => m.month === month && m.year === year);
            if (entry) {
                entry.count++;
            }
        });
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.maintenanceTrend) {
            this.charts.maintenanceTrend.destroy();
        }
        
        this.charts.maintenanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last6Months.map(m => m.month),
                datasets: [{
                    label: 'Maintenance Tasks',
                    data: last6Months.map(m => m.count),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    // Render top assets by issues
    renderTopAssets() {
        const container = document.getElementById('topAssetsList');
        if (!container) return;
        
        const assets = Storage.getAssets();
        const issues = Storage.getIssues();
        
        const assetIssueCount = {};
        assets.forEach(asset => {
            assetIssueCount[asset.id] = {
                name: asset.name,
                code: asset.code,
                count: 0
            };
        });
        
        issues.forEach(issue => {
            if (assetIssueCount[issue.assetId]) {
                assetIssueCount[issue.assetId].count++;
            }
        });
        
        const sorted = Object.values(assetIssueCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        if (sorted.length === 0 || sorted.every(a => a.count === 0)) {
            container.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }
        
        container.innerHTML = sorted.map((item, index) => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--light-gray);">
                <span>
                    <strong>#${index + 1}</strong> ${item.name} (${item.code})
                </span>
                <span style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem;">
                    ${item.count} issues
                </span>
            </div>
        `).join('');
    },
    
    // Render recent activity
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        const history = Storage.getHistory();
        const recent = history.slice(0, 10);
        
        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">No recent activity</p>';
            return;
        }
        
        container.innerHTML = recent.map(entry => `
            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--light-gray);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span style="font-weight: 500;">${entry.message}</span>
                        <div style="font-size: 0.8rem; color: var(--gray); margin-top: 0.25rem;">
                            ${Utils.formatDate(entry.timestamp)}
                        </div>
                    </div>
                    ${entry.type === 'issue_reported' ? '<span style="color: var(--danger);">⚠️</span>' : ''}
                    ${entry.type === 'issue_resolved' ? '<span style="color: var(--success);">✅</span>' : ''}
                    ${entry.type === 'maintenance_completed' ? '<span style="color: var(--success);">✅</span>' : ''}
                </div>
            </div>
        `).join('');
    }
};

// Export for browser
window.Analytics = Analytics;