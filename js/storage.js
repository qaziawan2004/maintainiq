// Storage management for MaintainIQ

const Storage = {
    // Keys
    KEYS: {
        ASSETS: 'maintainiq_assets',
        ISSUES: 'maintainiq_issues',
        MAINTENANCE: 'maintainiq_maintenance',
        HISTORY: 'maintainiq_history',
        NOTIFICATIONS: 'maintainiq_notifications',
        USERS: 'maintainiq_users',
        CURRENT_USER: 'maintainiq_current_user'
    },
    
    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    // Set data to localStorage
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    // Get current user
    getCurrentUser() {
        return this.get(this.KEYS.CURRENT_USER);
    },
    
    // Set current user
    setCurrentUser(user) {
        return this.set(this.KEYS.CURRENT_USER, user);
    },
    
    // Get users
    getUsers() {
        return this.get(this.KEYS.USERS) || [];
    },
    
    // Set users
    setUsers(users) {
        return this.set(this.KEYS.USERS, users);
    },
    
    // Get assets
    getAssets() {
        return this.get(this.KEYS.ASSETS) || [];
    },
    
    // Set assets
    setAssets(assets) {
        return this.set(this.KEYS.ASSETS, assets);
    },
    
    // Get issues
    getIssues() {
        return this.get(this.KEYS.ISSUES) || [];
    },
    
    // Set issues
    setIssues(issues) {
        return this.set(this.KEYS.ISSUES, issues);
    },
    
    // Get maintenance records
    getMaintenance() {
        return this.get(this.KEYS.MAINTENANCE) || [];
    },
    
    // Set maintenance records
    setMaintenance(maintenance) {
        return this.set(this.KEYS.MAINTENANCE, maintenance);
    },
    
    // Get history
    getHistory() {
        return this.get(this.KEYS.HISTORY) || [];
    },
    
    // Set history
    setHistory(history) {
        return this.set(this.KEYS.HISTORY, history);
    },
    
    // Get notifications
    getNotifications() {
        return this.get(this.KEYS.NOTIFICATIONS) || [];
    },
    
    // Set notifications
    setNotifications(notifications) {
        return this.set(this.KEYS.NOTIFICATIONS, notifications);
    },
    
    // Add to history
    addHistory(entry) {
        const history = this.getHistory();
        history.unshift({
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        });
        this.setHistory(history);
        return history;
    },
    
    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },
    
    // Reset demo data
    resetDemo() {
        this.clearAll();
        this.initDemoData();
    },
    
    // Initialize demo data
    initDemoData() {
        const demoAssets = [
            {
                id: 'asset_1',
                name: 'MacBook Pro 16"',
                code: 'MBP-2024-001',
                category: 'Electronics',
                location: 'Room 301, IT Department',
                description: 'Primary development laptop for senior developers',
                status: 'active',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'asset_2',
                name: 'HP LaserJet Pro MFP',
                code: 'PRN-2024-002',
                category: 'Equipment',
                location: 'Room 101, Admin Office',
                description: 'Network printer for administrative staff',
                status: 'maintenance',
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'asset_3',
                name: 'Toyota Hilux 2024',
                code: 'VEH-2024-003',
                category: 'Vehicle',
                location: 'Parking Lot A',
                description: 'Company utility vehicle for logistics',
                status: 'active',
                createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'asset_4',
                name: 'Conference Room Display',
                code: 'DSP-2024-004',
                category: 'Electronics',
                location: 'Conference Room 2',
                description: '85" 4K display for presentations',
                status: 'active',
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'asset_5',
                name: 'Office Desk Set',
                code: 'FUR-2024-005',
                category: 'Furniture',
                location: 'Open Workspace',
                description: 'Ergonomic desk set with adjustable height',
                status: 'retired',
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        const demoIssues = [
            {
                id: 'issue_1',
                assetId: 'asset_2',
                title: 'Paper jam and scanning error',
                description: 'Printer keeps jamming with paper and scanning function is not working',
                priority: 'high',
                status: 'in-progress',
                reportedBy: 'John Doe',
                reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                evidence: null,
                notes: [
                    {
                        text: 'Technician assigned. Parts ordered.',
                        author: 'Sarah Smith',
                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            },
            {
                id: 'issue_2',
                assetId: 'asset_3',
                title: 'Engine check light on',
                description: 'Check engine light appeared on dashboard, vehicle running rough',
                priority: 'critical',
                status: 'reported',
                reportedBy: 'Mike Johnson',
                reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                evidence: null,
                notes: []
            }
        ];
        
        const demoMaintenance = [
            {
                id: 'maint_1',
                assetId: 'asset_1',
                title: 'Battery replacement and cleaning',
                description: 'Battery health below 80%, scheduled replacement',
                status: 'scheduled',
                scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                assignedTo: 'Tech Team A',
                notes: 'Battery ordered, will arrive in 3 days',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'maint_2',
                assetId: 'asset_2',
                title: 'Print head alignment',
                description: 'Print quality issues, needs calibration',
                status: 'in-progress',
                scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                assignedTo: 'Tech Team B',
                notes: 'Calibration in progress',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        this.setAssets(demoAssets);
        this.setIssues(demoIssues);
        this.setMaintenance(demoMaintenance);
        
        // Add history entries
        demoAssets.forEach(asset => {
            this.addHistory({
                type: 'asset_created',
                assetId: asset.id,
                message: `Asset "${asset.name}" was created`,
                data: asset
            });
        });
        
        demoIssues.forEach(issue => {
            const asset = demoAssets.find(a => a.id === issue.assetId);
            this.addHistory({
                type: 'issue_reported',
                assetId: issue.assetId,
                message: `Issue "${issue.title}" was reported for ${asset?.name || 'Unknown Asset'}`,
                data: issue
            });
        });
    }
};

// Export for browser
window.Storage = Storage;