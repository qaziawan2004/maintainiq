 
// AI Integration for MaintainIQ

const AI = {
    // Mock AI response (since we're using localStorage, this mocks AI behavior)
    async getInsights(assets, issues, maintenance) {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const insights = [];
            
            // Total assets analysis
            const totalAssets = assets.length;
            const activeAssets = assets.filter(a => a.status === 'active').length;
            const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
            const retiredAssets = assets.filter(a => a.status === 'retired').length;
            
            // Asset health score
            const healthScore = totalAssets > 0 
                ? Math.round((activeAssets / totalAssets) * 100) 
                : 0;
            
            insights.push({
                type: 'health_score',
                title: 'Asset Health Score',
                message: `Your assets are ${healthScore}% healthy. ${activeAssets} active, ${maintenanceAssets} in maintenance, ${retiredAssets} retired.`,
                recommendation: healthScore < 70 
                    ? 'Consider reviewing assets in maintenance and creating a replacement plan for retired assets.' 
                    : 'Great job maintaining your assets! Keep up with regular maintenance.'
            });
            
            // Issue analysis
            const openIssues = issues.filter(i => i.status === 'reported' || i.status === 'in-progress');
            const criticalIssues = issues.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed');
            const resolvedIssues = issues.filter(i => i.status === 'resolved' || i.status === 'closed');
            
            if (openIssues.length > 0) {
                const avgResolutionTime = this.calculateAvgResolutionTime(issues);
                
                insights.push({
                    type: 'issues',
                    title: 'Issue Analysis',
                    message: `${openIssues.length} open issues (${criticalIssues.length} critical). Average resolution time: ${avgResolutionTime} days.`,
                    recommendation: criticalIssues.length > 0 
                        ? `⚠️ Critical issues detected! Prioritize resolving ${criticalIssues.length} critical issues immediately.` 
                        : 'No critical issues. Continue monitoring and resolving open issues.'
                });
            }
            
            // Maintenance analysis
            const upcomingMaintenance = maintenance.filter(m => m.status === 'scheduled');
            const overdueMaintenance = maintenance.filter(m => {
                if (m.status !== 'scheduled') return false;
                const scheduledDate = new Date(m.scheduledDate);
                return scheduledDate < new Date();
            });
            
            if (upcomingMaintenance.length > 0) {
                insights.push({
                    type: 'maintenance',
                    title: 'Maintenance Schedule',
                    message: `${upcomingMaintenance.length} scheduled maintenance tasks. ${overdueMaintenance.length} overdue.`,
                    recommendation: overdueMaintenance.length > 0 
                        ? `⚠️ ${overdueMaintenance.length} maintenance tasks are overdue! Please reschedule or prioritize them.` 
                        : 'All maintenance tasks are on schedule. Good planning!'
                });
            }
            
            // Asset distribution insight
            const categories = {};
            assets.forEach(asset => {
                categories[asset.category] = (categories[asset.category] || 0) + 1;
            });
            const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
            
            if (topCategory) {
                insights.push({
                    type: 'distribution',
                    title: 'Asset Distribution',
                    message: `${topCategory[0]} is your most common asset category with ${topCategory[1]} assets.`,
                    recommendation: 'Consider diversifying your asset portfolio or focusing on maintaining high-value categories.'
                });
            }
            
            return insights;
        } catch (error) {
            console.error('AI Insights error:', error);
            return [{
                type: 'error',
                title: 'AI Service Unavailable',
                message: 'Unable to generate AI insights. Please try again later.',
                recommendation: 'Check your internet connection and refresh the page.'
            }];
        }
    },
    
    // Calculate average resolution time
    calculateAvgResolutionTime(issues) {
        const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed');
        if (resolved.length === 0) return 0;
        
        const totalDays = resolved.reduce((sum, issue) => {
            const created = new Date(issue.reportedAt);
            const resolvedDate = new Date(issue.updatedAt);
            const days = (resolvedDate - created) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        
        return Math.round((totalDays / resolved.length) * 10) / 10;
    },
    
    // Triage issue with AI
    async triageIssue(issue) {
        // Mock AI triage
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const suggestions = [];
        
        // Priority-based suggestions
        if (issue.priority === 'critical') {
            suggestions.push('🚨 Critical issue - immediate attention required');
            suggestions.push('Notify maintenance team lead');
            suggestions.push('Consider temporary workaround or replacement');
        } else if (issue.priority === 'high') {
            suggestions.push('⚡ High priority - address within 24 hours');
            suggestions.push('Assign to senior technician');
        } else if (issue.priority === 'medium') {
            suggestions.push('📋 Medium priority - schedule within 3 days');
            suggestions.push('Standard maintenance procedure applies');
        } else {
            suggestions.push('📌 Low priority - add to backlog');
        }
        
        // Keyword-based suggestions
        const keywords = {
            'printer': 'Check paper path, toner levels, and network connection',
            'engine': 'Run diagnostic test, check fluid levels',
            'display': 'Check cables, input source, and power supply',
            'battery': 'Test battery health, check charging circuit',
            'network': 'Verify network connection, check IP configuration',
            'screen': 'Check display settings and connections',
            'sound': 'Check audio drivers and speaker connections',
            'power': 'Check power supply and connections'
        };
        
        const lowerTitle = issue.title.toLowerCase();
        const lowerDesc = issue.description.toLowerCase();
        
        for (const [keyword, suggestion] of Object.entries(keywords)) {
            if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
                suggestions.push(`🔧 ${suggestion}`);
            }
        }
        
        if (suggestions.length <= 1) {
            suggestions.push('💡 Perform basic troubleshooting and document findings');
            suggestions.push('📝 Update issue status as you make progress');
        }
        
        return {
            title: 'AI Triage Suggestions',
            suggestions: suggestions,
            estimatedResolution: this.estimateResolution(issue.priority)
        };
    },
    
    // Estimate resolution time
    estimateResolution(priority) {
        const estimates = {
            'critical': '2-4 hours',
            'high': '4-8 hours',
            'medium': '1-2 days',
            'low': '2-3 days'
        };
        return estimates[priority] || '1-2 days';
    }
};

// Export for browser
window.AI = AI;