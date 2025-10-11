// Lightweight UI helpers wrapper.
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

    // Backwards-compatible globals
    try { window.showToast = ui.showToast; } catch(e){}
    try { window.showError = ui.showError; } catch(e){}
    try { window.showLoading = ui.showLoading; } catch(e){}
    try { window.showKPIList = ui.showKPIList; } catch(e){}
    try { window.showDashboard = ui.showDashboard; } catch(e){}
    try { window.showEmptyState = ui.showEmptyState; } catch(e){}

    window.UnifiedDashboardModules.ui = ui;
})();
