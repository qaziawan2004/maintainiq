// Main application initialization

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Auth.requireAuth()) {
        return;
    }
    
    // Initialize app
    App.init();
});

const App = {
    init() {
        // Display user info
        this.displayUserInfo();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize modules
        Assets.init();
        Issues.init();
        Maintenance.init();
        History.init();
        Analytics.init();
        Notifications.updateBadge();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load demo data if empty
        if (Storage.getAssets().length === 0) {
            Storage.initDemoData();
            this.refreshAll();
        }
        
        // Generate AI insights
        this.loadAIInsights();
    },
    
    displayUserInfo() {
        const user = Auth.getCurrentUser();
        if (user) {
            document.getElementById('usernameDisplay').textContent = user.name || user.email;
        }
    },
    
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const toggleBtn = document.getElementById('themeToggleNav');
        
        // Check if toggle button exists
        if (!toggleBtn) {
            console.warn('Theme toggle button not found');
            return;
        }
        
        const icon = toggleBtn.querySelector('i');
        
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (icon) icon.className = 'fas fa-moon';
        }
        
        toggleBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (document.documentElement.getAttribute('data-theme') === 'light') {
                document.documentElement.removeAttribute('data-theme');
                if (icon) icon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                if (icon) icon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'light');
            }
        });
    },
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                App.navigateTo(page);
            });
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            Auth.logout();
        });
        
        // Reset demo data
        document.getElementById('resetDemoBtn').addEventListener('click', function() {
            if (confirm('This will reset all data to demo state. Continue?')) {
                Storage.resetDemo();
                Utils.showToast('Demo data reset successfully!', 'success');
                App.refreshAll();
            }
        });
        
        // Notifications
        document.getElementById('notifBtn').addEventListener('click', function() {
            Notifications.togglePanel();
        });
        
        document.getElementById('clearNotifBtn').addEventListener('click', function() {
            Notifications.clearAll();
        });
        
        // Hamburger menu
        document.getElementById('hamburger').addEventListener('click', function() {
            document.getElementById('navMenu').classList.toggle('open');
        });
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Close modals with close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
            });
        });
    },
    
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu
        document.getElementById('navMenu').classList.remove('open');
        
        // Refresh content based on page
        if (page === 'dashboard') {
            Analytics.updateStats();
            Analytics.renderCharts();
            Analytics.renderRecentActivity();
            this.loadAIInsights();
        } else if (page === 'assets') {
            Assets.renderAssets();
        } else if (page === 'issues') {
            Issues.renderIssues();
        } else if (page === 'maintenance') {
            Maintenance.renderMaintenance();
        } else if (page === 'history') {
            History.renderHistory();
        } else if (page === 'analytics') {
            Analytics.updateStats();
            Analytics.renderCharts();
            Analytics.renderTopAssets();
        }
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    refreshAll() {
        Analytics.updateStats();
        Assets.renderAssets();
        Issues.renderIssues();
        Maintenance.renderMaintenance();
        History.renderHistory();
        Analytics.renderCharts();
        Analytics.renderTopAssets();
        Analytics.renderRecentActivity();
        this.loadAIInsights();
    },
    
    async loadAIInsights() {
        const container = document.getElementById('aiInsights');
        if (!container) return;
        
        try {
            const assets = Storage.getAssets();
            const issues = Storage.getIssues();
            const maintenance = Storage.getMaintenance();
            
            const insights = await AI.getInsights(assets, issues, maintenance);
            
            container.innerHTML = insights.map(insight => `
                <div style="padding: 1rem; margin-bottom: 0.75rem; background: var(--glass-bg); border-radius: 10px; border-left: 4px solid var(--primary);">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${insight.title}</h4>
                    <p style="color: var(--text-secondary);">${insight.message}</p>
                    ${insight.recommendation ? `
                        <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-lightbulb" style="color: var(--warning);"></i>
                            ${insight.recommendation}
                        </p>
                    ` : ''}
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = '<p class="empty-state">Unable to load AI insights</p>';
        }
    }
};

// Export for browser
window.App = App;