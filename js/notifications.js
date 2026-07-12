 
// Notification system for MaintainIQ

const Notifications = {
    // Add notification
    add(message, type = 'info', link = null) {
        const notifications = Storage.getNotifications();
        const notification = {
            id: Utils.generateId(),
            message,
            type,
            link,
            read: false,
            timestamp: new Date().toISOString()
        };
        
        notifications.unshift(notification);
        Storage.setNotifications(notifications);
        this.updateBadge();
        this.renderList();
        
        // Show toast for important notifications
        if (type === 'critical' || type === 'warning') {
            Utils.showToast(message, type === 'critical' ? 'error' : 'warning');
        }
        
        return notification;
    },
    
    // Get unread count
    getUnreadCount() {
        const notifications = Storage.getNotifications();
        return notifications.filter(n => !n.read).length;
    },
    
    // Mark as read
    markAsRead(id) {
        const notifications = Storage.getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index].read = true;
            Storage.setNotifications(notifications);
            this.updateBadge();
            this.renderList();
        }
    },
    
    // Mark all as read
    markAllRead() {
        const notifications = Storage.getNotifications();
        notifications.forEach(n => n.read = true);
        Storage.setNotifications(notifications);
        this.updateBadge();
        this.renderList();
    },
    
    // Clear all
    clearAll() {
        Storage.setNotifications([]);
        this.updateBadge();
        this.renderList();
    },
    
    // Update badge
    updateBadge() {
        const badge = document.getElementById('notifBadge');
        if (badge) {
            const count = this.getUnreadCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },
    
    // Render notification list
    renderList() {
        const list = document.getElementById('notifList');
        if (!list) return;
        
        const notifications = Storage.getNotifications();
        
        if (notifications.length === 0) {
            list.innerHTML = '<p class="empty-state">No notifications</p>';
            return;
        }
        
        list.innerHTML = notifications.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div>${n.message}</div>
                ${n.link ? `<a href="${n.link}" style="color: var(--primary); font-size: 0.8rem; display: inline-block; margin-top: 0.25rem;">View</a>` : ''}
                <span class="notif-time">${Utils.formatDate(n.timestamp)}</span>
                ${!n.read ? `<button onclick="Notifications.markAsRead('${n.id}')" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; margin-top: 0.25rem; display: block;">Mark as read</button>` : ''}
            </div>
        `).join('');
    },
    
    // Toggle panel
    togglePanel() {
        const panel = document.getElementById('notifPanel');
        if (panel) {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) {
                this.renderList();
            }
        }
    },
    
    // Auto notifications
    notifyAssetCreated(asset) {
        this.add(`New asset created: ${asset.name} (${asset.code})`, 'info', '#assets');
    },
    
    notifyAssetUpdated(asset) {
        this.add(`Asset updated: ${asset.name}`, 'info', '#assets');
    },
    
    notifyIssueReported(issue, asset) {
        const priorityEmoji = {
            'low': '📌',
            'medium': '📋',
            'high': '⚡',
            'critical': '🚨'
        };
        this.add(
            `${priorityEmoji[issue.priority] || '📋'} New issue reported for ${asset.name}: ${issue.title}`,
            issue.priority === 'critical' ? 'critical' : 'warning',
            '#issues'
        );
    },
    
    notifyIssueUpdated(issue) {
        this.add(`Issue updated: ${issue.title} - Status: ${issue.status}`, 'info', '#issues');
    }
};

// Export for browser
window.Notifications = Notifications;