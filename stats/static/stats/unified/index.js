(function(){
    // Tiny loader for unified modules — call in templates via <script src="{% static 'stats/unified/index.js' %}" defer></script>
    window.UnifiedDashboard = window.UnifiedDashboard || {};
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    // Safe init: if in dev, dynamically load module files from /assets/unified-src/, then initialize.
    function _runInitializers() {
        try { if (window.UnifiedDashboardModules.pageHelpers && typeof window.UnifiedDashboardModules.pageHelpers.initShowMoreButtons === 'function') window.UnifiedDashboardModules.pageHelpers.initShowMoreButtons(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.pageHelpers && typeof window.UnifiedDashboardModules.pageHelpers.initEmailConfirm === 'function') window.UnifiedDashboardModules.pageHelpers.initEmailConfirm(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.team && typeof window.UnifiedDashboardModules.team.initTeamManagementHandlers === 'function') window.UnifiedDashboardModules.team.initTeamManagementHandlers(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.delete && typeof window.UnifiedDashboardModules.delete.initDeleteHandlers === 'function') window.UnifiedDashboardModules.delete.initDeleteHandlers(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.chart && typeof window.UnifiedDashboardModules.chart.drawChart === 'function') {
            const canvas = document.getElementById('myChart');
            if (canvas) window.UnifiedDashboardModules.chart.drawChart().catch(()=>{});
        } } catch(e) {}
        try { if (window.UnifiedDashboardModules.websocket && typeof window.UnifiedDashboardModules.websocket.initWebSocket === 'function') {
            const slug = document.getElementById('dashboard-slug')?.textContent?.trim();
            if (slug) window.UnifiedDashboardModules.websocket.initWebSocket(slug);
        } } catch(e) {}
    }

    document.addEventListener('DOMContentLoaded', function() {
        const useDev = !!window.UNIFIED_DASHBOARD_DEV;
        if (!useDev) {
            _runInitializers();
            return;
        }

        // Dev mode: attempt to load module sources from /assets/unified-src/
        const modules = ['ui.js','page-helpers.js','team.js','forms.js','delete.js','kpi-list.js','chart.js','websocket.js'];
        const basePath = '/assets/unified-src/';

        const loaders = modules.map(name => new Promise((resolve) => {
            const url = basePath + name;
            const existing = document.querySelector(`script[src="${url}"]`);
            if (existing) return resolve(true);
            const s = document.createElement('script');
            s.src = url;
            s.onload = () => resolve(true);
            s.onerror = () => { console.warn('Failed to load', url); resolve(false); };
            document.head.appendChild(s);
        }));

        Promise.all(loaders).then(() => _runInitializers()).catch(() => _runInitializers());
    });
})();
