(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};
    const wsModule = {
        initWebSocket(slug) {
            try {
                const state = window.UnifiedDashboardModules._state = window.UnifiedDashboardModules._state || {};
                if (state.socket && state.socket.readyState === WebSocket.OPEN) {
                    try { state.socket.close(); } catch(e){}
                }
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const socket = new WebSocket(`${protocol}//${window.location.host}/ws/${slug}/`);
                state.socket = socket;

                socket.onopen = function(e) { console.log('WebSocket connected for', slug); };

                socket.onmessage = function(e) {
                    try {
                        const {sender, message} = JSON.parse(e.data);
                        const dataBox = document.getElementById('data-box') || document.querySelector('#dashboard-content #data-box');
                        if (dataBox) dataBox.innerHTML += `<p>${sender}: ${message}</p>`;
                        if (window.UnifiedDashboardModules && window.UnifiedDashboardModules.chart && typeof window.UnifiedDashboardModules.chart.updateChart === 'function') {
                            window.UnifiedDashboardModules.chart.updateChart();
                        }
                    } catch (err) { console.error('WS message parse error', err); }
                };

                socket.onerror = function(e) { console.error('WebSocket error', e); };
                socket.onclose = function(e) { console.log('WebSocket closed', e.code, e.reason); };

            } catch (e) { console.error('initWebSocket failed', e); }
        },
        closeWebSocket() {
            try { const s = window.UnifiedDashboardModules._state && window.UnifiedDashboardModules._state.socket; if (s) s.close(); } catch(e){}
        }
    };
    window.UnifiedDashboardModules.websocket = wsModule;
})();
