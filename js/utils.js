 
// Utility functions for MaintainIQ

const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    // Format date
    formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Format date short
    formatDateShort(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Get status color
    getStatusColor(status) {
        const colors = {
            'active': '#22c55e',
            'maintenance': '#eab308',
            'retired': '#ef4444',
            'reported': '#f97316',
            'in-progress': '#3b82f6',
            'resolved': '#22c55e',
            'closed': '#64748b'
        };
        return colors[status] || '#64748b';
    },
    
    // Get priority label
    getPriorityLabel(priority) {
        const labels = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical'
        };
        return labels[priority] || priority;
    },
    
    // Truncate text
    truncate(text, length = 100) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },
    
    // Capitalize first letter
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Check if string is empty
    isEmpty(str) {
        return !str || str.trim() === '';
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Export for browser
window.Utils = Utils;