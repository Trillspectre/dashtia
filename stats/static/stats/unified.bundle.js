(function(){
/* Bundled unified modules - rebuilt from assets/unified-src */

// --- ui.js ---
(function () {
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    function hideAllContainers() {
        const containers = [
            document.getElementById('loading-indicator'),
            document.getElementById('kpi-list-container'),
            document.getElementById('dashboard-container'),
            document.getElementById('empty-state')
        ];
        containers.forEach(container => { if (container) container.classList.add('d-none'); });
    }

    function showLoading() {
        hideAllContainers();
        const el = document.getElementById('loading-indicator');
        if (el) el.classList.remove('d-none');
    }

    function showKPIList() {
        hideAllContainers();
        const el = document.getElementById('kpi-list-container');
        if (el) el.classList.remove('d-none');
    }

    function showDashboard() {
        hideAllContainers();
        const el = document.getElementById('dashboard-container');
        if (el) el.classList.remove('d-none');
    }

    function showEmptyState() {
        hideAllContainers();
        const el = document.getElementById('empty-state');
        if (el) el.classList.remove('d-none');
    }

    function showToast(message, type = 'success') {
        try {
            if (window.bootstrap && document) {
                let toastContainer = document.getElementById('toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'toast-container';
                    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
                    document.body.appendChild(toastContainer);
                }
                const toastEl = document.createElement('div');
                toastEl.className = `toast align-items-center text-bg-${type} border-0`;
                toastEl.setAttribute('role', 'alert');
                toastEl.setAttribute('aria-live', 'assertive');
                toastEl.setAttribute('aria-atomic', 'true');
                toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
                toastContainer.appendChild(toastEl);
                const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
                bsToast.show();
                return;
            }
        } catch (e) { /* fall through */ }
        alert(message);
    }

    function showError(message) { showToast(message, 'danger'); }

    function debounce(fn, wait) { let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); } }

    const ui = { showToast, showError, showLoading, showKPIList, showDashboard, showEmptyState, hideAllContainers, debounce };

    try { window.showToast = ui.showToast; } catch(e){}
    try { window.showError = ui.showError; } catch(e){}
    try { window.showLoading = ui.showLoading; } catch(e){}
    try { window.showKPIList = ui.showKPIList; } catch(e){}
    try { window.showDashboard = ui.showDashboard; } catch(e){}
    try { window.showEmptyState = ui.showEmptyState; } catch(e){}

    window.UnifiedDashboardModules.ui = ui;
})();

})();

// --- page-helpers.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    const helpers = {
        initShowMoreButtons() {
            document.querySelectorAll('.show-more-btn').forEach(function (btn) {
                if (btn.__show_more_initialized) return;
                btn.__show_more_initialized = true;
                btn.addEventListener('click', function () {
                    const cardBody = btn.closest('.card-body');
                    const content = cardBody.querySelector('.card-content');
                    const expanded = content.getAttribute('aria-expanded') === 'true';
                    if (expanded) {
                        content.style.maxHeight = '220px';
                        content.setAttribute('aria-expanded', 'false');
                        btn.textContent = 'Show more';
                    } else {
                        content.style.maxHeight = 'none';
                        content.setAttribute('aria-expanded', 'true');
                        btn.textContent = 'Show less';
                    }
                });
            });
        },
        initEmailConfirm() {
            const actions = document.getElementsByName('action_remove');
            if (actions.length) {
                const handler = function(e) {
                    const message = window.UnifiedDashboard && window.UnifiedDashboard.emailRemoveMessage ? window.UnifiedDashboard.emailRemoveMessage : 'Do you really want to remove the selected email address?';
                    if (!confirm(message)) {
                        e.preventDefault();
                    }
                };
                if (!actions[0].__email_confirm_initialized) {
                    actions[0].addEventListener('click', handler);
                    actions[0].__email_confirm_initialized = true;
                }
            }
        }
    };

    window.UnifiedDashboardModules.pageHelpers = helpers;
})();

// --- team.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    const team = {
        initTeamManagementHandlers() {
            const addMemberModal = document.getElementById('addMemberModal');
            if (addMemberModal && !addMemberModal.__team_handlers) {
                addMemberModal.addEventListener('show.bs.modal', function (event) {
                    const button = event.relatedTarget;
                    if (!button) return;
                    const teamId = button.getAttribute('data-team-id');
                    const teamName = button.getAttribute('data-team-name');
                    const idEl = document.getElementById('member_team_id');
                    const nameEl = document.getElementById('member_team_name');
                    if (idEl) idEl.value = teamId;
                    if (nameEl) nameEl.textContent = teamName;
                });
                addMemberModal.__team_handlers = true;
            }

            document.querySelectorAll('form[method="post"]').forEach(form => {
                if (form.__form_debug_attached) return;
                form.addEventListener('submit', function(e) {
                    try { console.log('Form submitting:', this); } catch (err) {}
                });
                form.__form_debug_attached = true;
            });
        }
    };

    window.UnifiedDashboardModules.team = team;
})();

// --- forms.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    function getCSRFCookie(name='csrftoken'){
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function attachCustomUnitHandlers(){
        try { if (typeof showCustomUnit === 'function') { showCustomUnit(); } } catch (e) {}
        try { if (typeof showCustomUnitEdit === 'function') { showCustomUnitEdit(); } } catch (e) {}
    }

    function initFormToggles(){
        const unitType = document.getElementById('unit_type');
        const customUnit = document.getElementById('custom-unit-input');
        const visibility = document.getElementById('visibility');
        const teamsContainer = document.getElementById('teams-select-container');

        function updateUnit() {
            if (!unitType) return;
            if (unitType.value === 'custom') {
                if (customUnit) customUnit.style.display = '';
            } else {
                if (customUnit) customUnit.style.display = 'none';
            }
        }

        function updateVisibility() {
            if (!visibility) return;
            if (visibility.value === 'team') {
                if (teamsContainer) teamsContainer.style.display = '';
            } else {
                if (teamsContainer) teamsContainer.style.display = 'none';
            }
        }

        if (unitType && !unitType.__forms_attached) {
            unitType.addEventListener('change', updateUnit);
            unitType.__forms_attached = true;
        }

        if (visibility && !visibility.__forms_attached) {
            visibility.addEventListener('change', updateVisibility);
            visibility.__forms_attached = true;
        }

        // initialize
        updateUnit();
        updateVisibility();
    }

    window.UnifiedDashboardModules.forms = { getCSRFCookie, attachCustomUnitHandlers, initFormToggles };
})();

// --- delete.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};
    const ui = window.UnifiedDashboardModules && window.UnifiedDashboardModules.ui;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function initDeleteHandlers() {
        let currentKpiId = null;
        let lastClickedDeleteBtn = null;
        let deleteModal = null;
        try {
            const modalEl = document.getElementById('deleteConfirmModal');
            if (modalEl && window.bootstrap && typeof bootstrap.Modal === 'function') {
                deleteModal = new bootstrap.Modal(modalEl);
            } else {
                deleteModal = null;
            }
        } catch (e) {
            console.error('Error initializing bootstrap modal', e);
            deleteModal = null;
        }

        document.querySelectorAll('.delete-kpi-btn').forEach(function (btn) {
            if (btn.__delete_initialized) return;
            btn.__delete_initialized = true;
            btn.addEventListener('click', function (ev) {
                try { if (ev && typeof ev.preventDefault === 'function') ev.preventDefault(); } catch (e) {}
                currentKpiId = btn.getAttribute('data-kpi-id');
                lastClickedDeleteBtn = btn;
                if (deleteModal) {
                    deleteModal.show();
                } else {
                    if (confirm('Are you sure you want to delete this KPI?')) {
                        const confirmBtn = document.getElementById('confirmDeleteBtn');
                        if (confirmBtn) confirmBtn.click();
                    }
                }
            });
        });

        const confirmBtnEl = document.getElementById('confirmDeleteBtn');
        if (!confirmBtnEl) return;

        confirmBtnEl.addEventListener('click', function () {
            if (!currentKpiId) {
                ui && ui.showToast && ui.showToast('No KPI selected for deletion', 'danger');
                if (deleteModal) deleteModal.hide();
                return;
            }
            const csrftoken = getCookie('csrftoken');
            const btnRef = lastClickedDeleteBtn || document.querySelector(`.delete-kpi-btn[data-kpi-id="${currentKpiId}"]`);
            const deleteUrl = btnRef && btnRef.getAttribute ? btnRef.getAttribute('data-delete-url') : `/stats/${currentKpiId}/delete/`;

            const origText = confirmBtnEl.innerHTML;
            confirmBtnEl.disabled = true;
            confirmBtnEl.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';

            fetch(deleteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({})
            }).then(resp => {
                if (!resp.ok) throw resp;
                return resp.json();
            }).then(data => {
                if (data.success) {
                    try {
                        const btnEl = btnRef && btnRef.closest ? btnRef : (document.querySelector(`.delete-kpi-btn[data-kpi-id="${currentKpiId}"]`) || null);
                        if (btnEl) {
                            const card = (btnEl.closest && (btnEl.closest('.col-md-6') || btnEl.closest('.card'))) || btnEl.parentElement;
                            if (card && typeof card.remove === 'function') {
                                card.remove();
                            } else {
                                console.warn('Could not remove card node, reloading page as fallback');
                                window.location.reload();
                            }
                        } else {
                            console.warn('Delete button element not found after successful delete, reloading');
                            window.location.reload();
                        }
                    } catch (e) {
                        console.error('Error removing deleted KPI element', e);
                        window.location.reload();
                    }
                    ui && ui.showToast && ui.showToast('KPI deleted (soft-delete)');
                } else {
                    ui && ui.showToast && ui.showToast(data.error || 'Delete failed', 'danger');
                }
            }).catch(async err => {
                console.error('Fetch delete error', err);
                let msg = 'Delete failed via fetch; falling back to form POST.';
                ui && ui.showToast && ui.showToast(msg, 'warning');

                try {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = deleteUrl;
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'csrfmiddlewaretoken';
                    input.value = csrftoken || '';
                    form.appendChild(input);
                    document.body.appendChild(form);
                    form.submit();
                } catch (e) {
                    console.error('Fallback form POST failed', e);
                    ui && ui.showToast && ui.showToast('Delete fallback failed', 'danger');
                }
            }).finally(() => {
                if (deleteModal) deleteModal.hide();
                currentKpiId = null;
                lastClickedDeleteBtn = null;
                confirmBtnEl.disabled = false;
                confirmBtnEl.innerHTML = origText;
            });
        });
    }

    function initDataItemDeleteHandlers() {
        let currentDataItemEl = null;
        let currentDataDeleteUrl = null;
        let lastClickedDataDeleteBtn = null;
        let dataDeleteModal = null;
        try {
            const dataModalEl = document.getElementById('deleteDataConfirmModal');
            if (dataModalEl && window.bootstrap && typeof bootstrap.Modal === 'function') {
                dataDeleteModal = new bootstrap.Modal(dataModalEl);
            } else {
                dataDeleteModal = null;
            }
        } catch (e) { dataDeleteModal = null; }

        document.querySelectorAll('.delete-data-btn').forEach(function (btn) {
            if (btn.__data_delete_init) return;
            btn.__data_delete_init = true;
            btn.addEventListener('click', function (ev) {
                ev.preventDefault();
                lastClickedDataDeleteBtn = btn;
                currentDataItemEl = btn.closest('.data-item');
                currentDataDeleteUrl = btn.getAttribute('data-delete-url');
                if (dataDeleteModal) {
                    dataDeleteModal.show();
                } else {
                    if (confirm('Delete this data point?')) {
                        const confirmBtn = document.getElementById('confirmDeleteDataBtn');
                        if (confirmBtn) confirmBtn.click();
                    }
                }
            });
        });

        const confirmDataBtn = document.getElementById('confirmDeleteDataBtn');
        if (!confirmDataBtn) return;
        confirmDataBtn.addEventListener('click', function () {
            if (!currentDataDeleteUrl || !currentDataItemEl) {
                ui && ui.showToast && ui.showToast('No data point selected', 'danger');
                if (dataDeleteModal) dataDeleteModal.hide();
                return;
            }

            const csrftoken = getCookie('csrftoken');

            const origText = confirmDataBtn.innerHTML;
            confirmDataBtn.disabled = true;
            confirmDataBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';

            fetch(currentDataDeleteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({})
            }).then(resp => {
                if (!resp.ok) throw resp;
                return resp.json();
            }).then(data => {
                if (data.success) {
                    try {
                        const elToRemove = currentDataItemEl || (lastClickedDataDeleteBtn && lastClickedDataDeleteBtn.closest ? lastClickedDataDeleteBtn.closest('.data-item') : null);
                        if (elToRemove && typeof elToRemove.remove === 'function') {
                            elToRemove.remove();
                        } else if (elToRemove) {
                            elToRemove.style.display = 'none';
                        } else {
                            console.warn('Could not locate data item element to remove');
                        }
                    } catch (e) { console.error('Error removing data item', e); }
                    ui && ui.showToast && ui.showToast('Data point deleted');
                } else {
                    ui && ui.showToast && ui.showToast(data.error || 'Delete failed', 'danger');
                }
            }).catch(err => {
                console.error('Data delete error', err);
                ui && ui.showToast && ui.showToast('Delete failed; try refreshing', 'warning');
            }).finally(() => {
                if (dataDeleteModal) dataDeleteModal.hide();
                currentDataItemEl = null;
                currentDataDeleteUrl = null;
                confirmDataBtn.disabled = false;
                confirmDataBtn.innerHTML = origText;
            });
        });
    }

    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};
    window.UnifiedDashboardModules.delete = { initDeleteHandlers, deleteKpi: null, initDataItemDeleteHandlers: initDataItemDeleteHandlers };
})();

// --- kpi-list.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};
    const ui = window.UnifiedDashboardModules && window.UnifiedDashboardModules.ui;

    const kpiListModule = {
        initSelector() {
            try {
                const selector = document.getElementById('dashboard-selector');
                const backBtn = document.getElementById('back-to-list');
                if (selector && !selector.__kpi_selector_init) {
                    selector.addEventListener('change', function () {
                        const val = selector.value;
                        if (!val) return;
                        kpiListModule.loadKPIsForSelection(val);
                    });
                    selector.__kpi_selector_init = true;
                }
                if (backBtn && !backBtn.__kpi_back_init) {
                    backBtn.addEventListener('click', function () {
                        try { window.UnifiedDashboardModules.ui.showKPIList(); } catch (e) {}
                    });
                    backBtn.__kpi_back_init = true;
                }
            } catch (e) { console.error('initSelector failed', e); }
        },
        async loadKPIsForSelection(selection) {
            try {
                if (!selection) return;
                if (typeof window.showLoading === 'function') window.showLoading();
                const response = await fetch(`/stats/api/team-kpis/?selection=${encodeURIComponent(selection)}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (data.success) {
                    kpiListModule.renderKPIList(data.kpis, data.selection_type);
                    if (typeof window.showKPIList === 'function') window.showKPIList();
                } else {
                    throw new Error(data.error || 'Failed to load KPIs');
                }
            } catch (error) {
                console.error('Error loading KPIs:', error);
                ui && ui.showError && ui.showError(`Failed to load KPIs: ${error.message}`);
            }
        },
        renderKPIList(kpis, selectionType) {
            const kpiList = document.getElementById('kpi-list');
            if (!kpiList) {
                console.warn('KPI list container not found');
                return;
            }
            kpiList.innerHTML = '';
            if (!kpis || kpis.length === 0) {
                kpiList.innerHTML = `<div class="col-12"><div class="alert alert-info text-center"><i class="fas fa-info-circle"></i><strong>No KPIs found</strong><p class="mb-0">This ${selectionType} doesn't have any KPIs yet.</p></div></div>`;
                return;
            }
            kpis.forEach(kpi => {
                const node = kpiListModule.createKPICard(kpi);
                kpiList.appendChild(node);
            });
        },
        createKPICard(kpi) {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-3';
            col.innerHTML = `
                <div class="card h-100 kpi-card" data-kpi-slug="${kpi.slug}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${kpi.name}</h6>
                            <span class="badge bg-primary">${kpi.chart_type}</span>
                        </div>
                        <p class="text-muted small mb-2"><i class="fas fa-user"></i> Created by: ${kpi.owner}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted"><i class="fas fa-chart-bar"></i> ${kpi.data_count} data points</small>
                            <a href="/stats/${kpi.slug}/" class="btn btn-outline-primary btn-sm"><i class="fas fa-eye"></i> View</a>
                        </div>
                    </div>
                </div>
            `;
            const card = col.querySelector('.kpi-card');
            const anchor = col.querySelector('a');
            if (anchor) {
                anchor.addEventListener('click', (e) => {
                    try { e.stopPropagation(); } catch(err){}
                    console.debug('KPI View anchor clicked', { href: anchor.href, button: e.button, meta: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey });
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    if (e.button && e.button !== 0) return;
                    try { window.location.href = anchor.href; } catch(err){}
                });
            }
            // Card click-to-load behavior removed; navigation is handled by the anchor only.
            return col;
        },
        async loadKPIDashboard(kpi) {
            try {
                if (!kpi || !kpi.slug) return;
                if (typeof window.showLoading === 'function') window.showLoading();
                const resp = await fetch(`/stats/${kpi.slug}/`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const html = await resp.text();
                const temp = document.createElement('div'); temp.innerHTML = html;
                const mainContent = temp.querySelector('.container') || temp.querySelector('main') || temp;
                const dashboardContent = document.getElementById('dashboard-content');
                if (dashboardContent) dashboardContent.innerHTML = mainContent.innerHTML;
                if (typeof window.initializeDashboardScripts === 'function') window.initializeDashboardScripts(kpi.slug);
                if (typeof window.showDashboard === 'function') window.showDashboard();
            } catch (err) {
                console.error('Error loading KPI dashboard:', err);
                ui && ui.showError && ui.showError('Failed to load KPI dashboard. Please try again.');
            }
        }
    };

    window.UnifiedDashboardModules.kpiList = kpiListModule;
    try { if (document && document.readyState !== 'loading') kpiListModule.initSelector(); else document.addEventListener('DOMContentLoaded', () => kpiListModule.initSelector()); } catch(e){}
    // Normalize any stray <button>View</button> controls into proper anchor links
    function normalizeViewButtons() {
        try {
            document.querySelectorAll('button.btn.btn-outline-primary.btn-sm').forEach(function(btn){
                if (!btn.innerText || btn.innerText.indexOf('View') === -1) return;
                if (!btn.querySelector || !btn.querySelector('i.fas.fa-eye')) return;
                const card = btn.closest && btn.closest('.kpi-card');
                const slug = card && card.dataset && card.dataset.kpiSlug;
                const href = slug ? ('/stats/' + slug + '/') : (btn.getAttribute('data-href') || btn.getAttribute('data-kpi-href'));
                if (!href) return;
                const a = document.createElement('a');
                a.className = btn.className;
                a.href = href;
                a.innerHTML = btn.innerHTML;
                btn.replaceWith(a);
                a.addEventListener('click', (e) => {
                    try { e.stopPropagation(); } catch(err){}
                    console.debug('KPI View anchor clicked (normalized)', { href: a.href, button: e.button, meta: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey });
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    if (e.button && e.button !== 0) return;
                    try { window.location.href = a.href; } catch(err){}
                });
            });
        } catch (e) { console.error('normalizeViewButtons failed', e); }
    }
    try { document.addEventListener('DOMContentLoaded', normalizeViewButtons); } catch(e){}
    // Capture-phase click handler to force navigation for KPI View anchors
    function forceKPIAnchorNavigationCapture(e){
        try{
            // First, prefer real anchors used for View
            const a = e.target && e.target.closest && e.target.closest('a.btn.btn-outline-primary.btn-sm');
            // If no anchor, also accept button-like controls (legacy markup)
            if (!a) {
                const btn = e.target && e.target.closest && e.target.closest('button.btn.btn-outline-primary.btn-sm, button');
                if (btn) {
                    // sanity: must look like a View control
                    const text = (btn.innerText || '').trim();
                    if (text.indexOf('View') !== -1 || btn.querySelector && btn.querySelector('i.fas.fa-eye')) {
                        const card = btn.closest && btn.closest('.kpi-card');
                        if (card) {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            if (typeof e.button !== 'undefined' && e.button !== 0) return;
                            const slug = card.dataset && card.dataset.kpiSlug;
                            const href = slug ? ('/stats/' + slug + '/') : (btn.getAttribute('data-href') || btn.getAttribute('data-kpi-href'));
                            if (href) {
                                try { e.preventDefault(); e.stopPropagation(); } catch(_){ }
                                console.debug('KPI View button capture -> forcing navigation', { href });
                                try { window.location.href = href; } catch(err){}
                                return;
                            }
                        }
                    }
                }
                return;
            }
            const card = a.closest && a.closest('.kpi-card');
            if (!card) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (typeof e.button !== 'undefined' && e.button !== 0) return;
            try { e.preventDefault(); e.stopPropagation(); } catch(_){ }
            console.debug('KPI View anchor capture -> forcing navigation', { href: a.href });
            try { window.location.href = a.href; } catch(err){}
        } catch(err){ console.error('forceKPIAnchorNavigationCapture failed', err); }
    }
    try { document.addEventListener('click', forceKPIAnchorNavigationCapture, true); } catch(e){}
})();

// --- chart.js ---
(function(){
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    const chartModule = {
        async ensureChartJSLoaded() {
            if (typeof Chart !== 'undefined') return true;
            const existingScript = document.querySelector('script[src*="chart.js"]');
            if (existingScript) {
                return new Promise((resolve, reject) => {
                    existingScript.onload = () => resolve(true);
                    existingScript.onerror = () => reject(false);
                });
            }
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = () => resolve(true);
                script.onerror = () => reject(false);
                document.head.appendChild(script);
            });
        },

        async fetchChartData(slug = null) {
            try {
                const url = slug ? `/stats/${slug}/chart/` : window.location.href + 'chart/';
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching chart data:', error);
                throw error;
            }
        },

        async drawChart(slug = null, canvasContext = null) {
            try {
                await chartModule.ensureChartJSLoaded();
            } catch (error) {
                console.error('Cannot draw chart: Chart.js failed to load');
                return;
            }
            const chartCtx = canvasContext || document.getElementById('myChart')?.getContext('2d');
            if (!chartCtx) return;
            try {
                const data = await chartModule.fetchChartData(slug);
                const {chartData, chartLabels} = data;
                let currentChartType = 'bar';
                const chartTypeEl = document.getElementById('chart-type');
                if (chartTypeEl) currentChartType = chartTypeEl.textContent.trim();

                if (window.UnifiedDashboardModules && window.UnifiedDashboardModules._state && window.UnifiedDashboardModules._state.chartInstance) {
                    try { window.UnifiedDashboardModules._state.chartInstance.destroy(); } catch(e){}
                }

                const ChartCtor = window.Chart;
                if (!ChartCtor) return;

                const chartInstance = new ChartCtor(chartCtx, {
                    type: currentChartType,
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: chartModule.getDatasetLabel(currentChartType),
                            data: chartData,
                            backgroundColor: chartModule.getColors(chartData.length),
                            borderWidth: 1
                        }]
                    },
                    options: chartModule.getChartOptions(currentChartType)
                });

                window.UnifiedDashboardModules._state = window.UnifiedDashboardModules._state || {};
                window.UnifiedDashboardModules._state.chartInstance = chartInstance;

            } catch (error) {
                console.error('Error drawing chart:', error);
            }
        },

        async updateChart() {
            const state = window.UnifiedDashboardModules._state || {};
            const chart = state.chartInstance;
            if (!chart) return;
            try {
                const data = await chartModule.fetchChartData();
                const {chartData, chartLabels} = data;
                chart.data.labels = chartLabels;
                chart.data.datasets[0].data = chartData;
                chart.update();
            } catch (error) {
                console.error('Error updating chart:', error);
            }
        },

        getDatasetLabel(type) {
            const labels = {
                'pie': '% of contribution',
                'bar': 'Contribution Amount',
                'line': 'Contribution Trend',
                'doughnut': '% of contribution',
                'radar': 'Performance Metrics',
                'polarArea': 'Data Distribution'
            };
            return labels[type] || 'Data';
        },

        getColors(dataLength) {
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
            return colors.slice(0, dataLength);
        },

        getChartOptions(type) {
            const chartType = type && typeof type === 'string' ? type : 'bar';
            const baseOptions = {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Data Contributions by User (${chartType.toUpperCase()})` }
                }
            };
            if (chartType === 'bar') baseOptions.scales = { y: { beginAtZero: true } };
            if (chartType === 'line') {
                baseOptions.scales = { y: { beginAtZero: true } };
                baseOptions.elements = { line: { tension: 0.1 } };
            }
            return baseOptions;
        }
    };

    window.UnifiedDashboardModules.chart = chartModule;
})();

// --- websocket.js ---
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
                            try {
                                const {sender, message} = payload;
                                let item = null;
                                try { const parsed = JSON.parse(message); if (parsed && typeof parsed === 'object' && (parsed.value !== undefined || parsed.id !== undefined)) item = parsed; } catch (e) {}
                                if (!item) {
                                    const num = Number(message);
                                    if (!isNaN(num)) item = { owner: sender, value: num, timestamp: null, can_delete: false };
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
        },

        // Helpers for formatting
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

        formatValue(v) {
            try {
                const decimals = this._decimalsForInput();
                const n = Number(v);
                if (!isFinite(n)) return String(v);
                return n.toFixed(decimals);
            } catch (e) { return String(v); }
        },

        formatTimestamp(ts) {
            try {
                if (ts) return ts;
                return new Date().toLocaleString();
            } catch (e) { return '' + ts; }
        },

        addDataItemToList(item) {
            try {
                if (!item) return;
                const dataBox = document.getElementById('data-box');
                if (!dataBox) return;

                // Ensure ul container
                let ul = dataBox.querySelector('ul.list-group');
                if (!ul) {
                    ul = document.createElement('ul');
                    ul.className = 'list-group';
                    dataBox.innerHTML = '';
                    dataBox.appendChild(ul);
                }

                // Prevent duplicates
                if (item.id) {
                    const existing = ul.querySelector(`li[data-item-id="${item.id}"]`);
                    if (existing) {
                        const valueSpan = existing.querySelector('.data-value');
                        if (valueSpan) valueSpan.textContent = wsModule.formatValue(item.value);
                        const ts = existing.querySelector('.small.text-muted');
                        if (ts) ts.textContent = (item.timestamp || wsModule.formatTimestamp());
                        return;
                    }
                }

                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center data-item';
                if (item.id) li.setAttribute('data-item-id', item.id);

                const left = document.createElement('div');
                const strong = document.createElement('strong');
                strong.textContent = item.owner || '';
                left.appendChild(strong);
                left.appendChild(document.createTextNode(': '));
                const valueSpan = document.createElement('span');
                valueSpan.className = 'data-value';
                valueSpan.textContent = wsModule.formatValue(item.value);
                left.appendChild(valueSpan);
                const tsDiv = document.createElement('div');
                tsDiv.className = 'small text-muted';
                tsDiv.textContent = (item.timestamp || wsModule.formatTimestamp());
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

                ul.insertBefore(li, ul.firstChild);

                try {
                    if (window.UnifiedDashboardModules && window.UnifiedDashboardModules.delete && typeof window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers === 'function') {
                        window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers();
                    }
                } catch (e) { /* non-fatal */ }
            } catch (e) { console.error('addDataItemToList failed', e); }
        }
    };
    window.UnifiedDashboardModules.websocket = wsModule;
})();

// --- index.js loader ---
(function(){
    window.UnifiedDashboard = window.UnifiedDashboard || {};
    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};

    document.addEventListener('DOMContentLoaded', function() {
        try { if (window.UnifiedDashboardModules.pageHelpers && typeof window.UnifiedDashboardModules.pageHelpers.initShowMoreButtons === 'function') window.UnifiedDashboardModules.pageHelpers.initShowMoreButtons(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.pageHelpers && typeof window.UnifiedDashboardModules.pageHelpers.initEmailConfirm === 'function') window.UnifiedDashboardModules.pageHelpers.initEmailConfirm(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.team && typeof window.UnifiedDashboardModules.team.initTeamManagementHandlers === 'function') window.UnifiedDashboardModules.team.initTeamManagementHandlers(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.forms && typeof window.UnifiedDashboardModules.forms.initFormToggles === 'function') window.UnifiedDashboardModules.forms.initFormToggles(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.delete && typeof window.UnifiedDashboardModules.delete.initDeleteHandlers === 'function') window.UnifiedDashboardModules.delete.initDeleteHandlers(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.delete && typeof window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers === 'function') window.UnifiedDashboardModules.delete.initDataItemDeleteHandlers(); } catch(e) {}
        try { if (window.UnifiedDashboardModules.chart && typeof window.UnifiedDashboardModules.chart.drawChart === 'function') {
            const canvas = document.getElementById('myChart');
            if (canvas) window.UnifiedDashboardModules.chart.drawChart().catch(()=>{});
        } } catch(e) {}
        try { if (window.UnifiedDashboardModules.websocket && typeof window.UnifiedDashboardModules.websocket.initWebSocket === 'function') {
            const slug = document.getElementById('dashboard-slug')?.textContent?.trim();
            if (slug) window.UnifiedDashboardModules.websocket.initWebSocket(slug);
            try { if (typeof window.UnifiedDashboardModules.websocket.attachSendHandler === 'function') window.UnifiedDashboardModules.websocket.attachSendHandler(); } catch(e) {}
        } } catch(e) {}
    });
})();
