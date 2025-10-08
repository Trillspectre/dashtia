// Single valid websocket module
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
                        const payload = JSON.parse(e.data);

                                if (payload && payload.type === 'data_item' && payload.data_item) {
                                    try { wsModule.addDataItemToList(payload.data_item); } catch (err) { console.error('Failed to add data item to list', err); }
                                } else if (payload && payload.sender && payload.message) {
                                    // Backwards compatibility: if message is a simple numeric value, treat it as a data_item
                                    try {
                                        const {sender, message} = payload;
                                        let item = null;
                                        // If message is JSON serialized data_item, attempt parse
                                        try { const parsed = JSON.parse(message); if (parsed && typeof parsed === 'object' && (parsed.value !== undefined || parsed.id !== undefined)) item = parsed; } catch (e) {}
                                        // If not parsed, but numeric string, create a minimal data_item
                                        if (!item) {
                                            const num = Number(message);
                                            if (!isNaN(num)) {
                                                item = { owner: sender, value: num, timestamp: null, can_delete: false };
                                            }
                                        }
                                        if (item) {
                                            try { wsModule.addDataItemToList(item); } catch (err) { console.error('Failed to add converted data item', err); }
                                        } else {
                                            const dataBox = document.getElementById('data-box') || document.querySelector('#dashboard-content #data-box');
                                            if (dataBox) dataBox.innerHTML += `<p>${sender}: ${message}</p>`;
                                        }
                                    } catch (e) { console.error('processing legacy payload', e); }
                                }

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

        // Create and append a data-item to the `#data-box` list. Expects an object like:
        // { id, owner, value, timestamp, can_delete:boolean, delete_url }
        addDataItemToList(item) {
            try {
                if (!item) return;
                const dataBox = document.getElementById('data-box');
                if (!dataBox) return;

                // Ensure there is an <ul class="list-group"> container
                let ul = dataBox.querySelector('ul.list-group');
                if (!ul) {
                    ul = document.createElement('ul');
                    ul.className = 'list-group';
                    dataBox.innerHTML = '';
                    dataBox.appendChild(ul);
                }

                // Prevent duplicates: update existing element if present
                if (item.id) {
                    const existing = ul.querySelector(`li[data-item-id="${item.id}"]`);
                    if (existing) {
                        // Update value and timestamp, then return
                        const valueSpan = existing.querySelector('.data-value');
                        if (valueSpan) valueSpan.textContent = wsModule._formatValue(item.value);
                        const ts = existing.querySelector('.small.text-muted');
                        if (ts) ts.textContent = (item.timestamp || wsModule._formatTimestamp());
                        return;
                    }
                }

                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center data-item';
                if (item.id) li.setAttribute('data-item-id', item.id);

                // Build left content to match template: <strong>owner</strong>: <span class="data-value">value</span><div class="small text-muted">timestamp</div>
                const left = document.createElement('div');
                const strong = document.createElement('strong');
                strong.textContent = item.owner || '';
                left.appendChild(strong);
                left.appendChild(document.createTextNode(': '));
                const valueSpan = document.createElement('span');
                valueSpan.className = 'data-value';
                valueSpan.textContent = wsModule._formatValue(item.value);
                left.appendChild(valueSpan);
                const tsDiv = document.createElement('div');
                tsDiv.className = 'small text-muted';
                tsDiv.textContent = (item.timestamp || wsModule._formatTimestamp());
                left.appendChild(tsDiv);

                li.appendChild(left);

                if (item.can_delete) {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn btn-sm btn-outline-danger ms-3 delete-data-btn';
                    if (item.delete_url) btn.setAttribute('data-delete-url', item.delete_url);
                    btn.setAttribute('title', 'Delete data item');
                    btn.innerHTML = '&times;';
                    li.appendChild(btn);
                } else {
                    const span = document.createElement('span');
                    span.className = 'text-muted small';
                    span.textContent = '\u00A0';
                    li.appendChild(span);
                }

                // Insert at the top
                ul.insertBefore(li, ul.firstChild);

                // Re-run delete handler wiring for any newly-added button(s)
                try {
                    if (window.UnifiedDashboardModules && window.UnifiedDashboardModules.delete && typeof window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers === 'function') {
                        window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers();
                    }
                } catch (e) { /* non-fatal */ }
            } catch (e) {
                console.error('addDataItemToList failed', e);
            }
        },

        // Determine decimals from the data-input step attribute; fallback to 2
        _decimalsForInput() {
            try {
                const inp = document.getElementById('data-input');
                if (!inp) return 2;
                const step = inp.getAttribute('step');
                if (!step) return 2;
                if (step.indexOf('.') !== -1) return step.split('.')[1].length;
                return 0;
            } catch (e) { return 2; }
        },

        _formatValue(v) {
            try {
                const decimals = this._decimalsForInput();
                const n = Number(v);
                if (!isFinite(n)) return String(v);
                return n.toFixed(decimals);
            } catch (e) { return String(v); }
        },

        _formatTimestamp(ts) {
            try {
                if (ts) return ts;
                return new Date().toLocaleString();
            } catch (e) { return '' + ts; }
        },

        closeWebSocket() { try { const s = window.UnifiedDashboardModules._state && window.UnifiedDashboardModules._state.socket; if (s) s.close(); } catch(e){} }
    };
    window.UnifiedDashboardModules.websocket = wsModule;
})();
