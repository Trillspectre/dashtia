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
        _validateValueAgainstInput(inputEl, val) {
            try {
                if (!inputEl) return { ok: true };
                const minAttr = inputEl.getAttribute('min');
                const maxAttr = inputEl.getAttribute('max');
                const num = parseFloat(val);
                if (minAttr !== null && minAttr !== '' && !isNaN(num)) {
                    const min = parseFloat(minAttr);
                    if (num < min) return { ok: false, error: `Value must be ≥ ${min}` };
                }
                if (maxAttr !== null && maxAttr !== '' && !isNaN(num)) {
                    const max = parseFloat(maxAttr);
                    if (num > max) return { ok: false, error: `Value must be ≤ ${max}` };
                }
                return { ok: true };
            } catch (e) { return { ok: true }; }
        },
        attachSendHandler() {
            try {
                const state = window.UnifiedDashboardModules._state = window.UnifiedDashboardModules._state || {};
                const btn = document.getElementById('submit-btn');
                if (!btn || btn.__ws_send_attached) return;
                btn.__ws_send_attached = true;
                btn.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    const input = document.getElementById('data-input');
                    const slug = document.getElementById('dashboard-slug')?.textContent?.trim();
                    const user = document.getElementById('user')?.textContent?.trim() || 'anonymous';
                    if (!input) return;
                    const val = input.value;
                    if (val === '' || val === null || typeof val === 'undefined') return;

                    const v = wsModule._validateValueAgainstInput(input, val);
                    if (!v.ok) {
                        try { window.UnifiedDashboardModules.ui.showError(v.error); } catch (e) { alert(v.error); }
                        return;
                    }

                    const socket = state.socket;
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        try {
                            socket.send(JSON.stringify({ sender: user, message: val }));
                            input.value = '';
                        } catch (e) {
                            console.error('WS send failed', e);
                        }
                        return;
                    }

                    // Fallback: submit a form POST to the current page
                    try {
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = window.location.pathname;
                        const inputEl = document.createElement('input');
                        inputEl.type = 'hidden';
                        inputEl.name = 'value';
                        inputEl.value = val;
                        form.appendChild(inputEl);
                        const csrf = (document.querySelector('input[name=csrfmiddlewaretoken]') || {}).value || null;
                        if (csrf) {
                            const csrfEl = document.createElement('input');
                            csrfEl.type = 'hidden';
                            csrfEl.name = 'csrfmiddlewaretoken';
                            csrfEl.value = csrf;
                            form.appendChild(csrfEl);
                        }
                        document.body.appendChild(form);
                        form.submit();
                    } catch (e) { console.error('Fallback submit failed', e); }
                });
            } catch (e) { console.error('attachSendHandler failed', e); }
        },
        closeWebSocket() {
            try { const s = window.UnifiedDashboardModules._state && window.UnifiedDashboardModules._state.socket; if (s) s.close(); } catch(e){}
        }
    };
    window.UnifiedDashboardModules.websocket = wsModule;
})();
