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
        // keep reference to the button that opened the modal so we don't rely on querying the DOM later
        let lastClickedDeleteBtn = null;
        let deleteModal = null;
        try {
            // Only initialize bootstrap modal if the element exists and bootstrap is available.
            const modalEl = document.getElementById('deleteConfirmModal');
            if (modalEl && window.bootstrap && typeof bootstrap.Modal === 'function') {
                deleteModal = new bootstrap.Modal(modalEl);
            } else if (!modalEl) {
                // no modal in DOM — we'll fall back to confirm() when needed
                deleteModal = null;
            }
        } catch (e) {
            // Defensive: log error and disable modal usage so code falls back to confirm dialog
            console.error('Error initializing bootstrap modal', e);
            deleteModal = null;
        }

        document.querySelectorAll('.delete-kpi-btn').forEach(function (btn) {
            if (btn.__delete_initialized) return;
            btn.__delete_initialized = true;
            btn.addEventListener('click', function (ev) {
                // prevent the form from submitting immediately
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
            // prefer the original clicked element (in case DOM changed) otherwise fall back to querying
            const btnRef = lastClickedDeleteBtn || document.querySelector(`.delete-kpi-btn[data-kpi-id="${currentKpiId}"]`);
            const deleteUrl = btnRef && btnRef.getAttribute ? btnRef.getAttribute('data-delete-url') : `/stats/${currentKpiId}/delete/`;

            // disable confirm button and show spinner
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
                // restore button
                confirmBtnEl.disabled = false;
                confirmBtnEl.innerHTML = origText;
            });
        });
    }

    // Data-item deletion (per-data-point) confirmation wiring
    function initDataItemDeleteHandlers() {
        let currentDataItemEl = null;
        let currentDataDeleteUrl = null;
        let dataDeleteModal = null;
        try {
            const dataModalEl = document.getElementById('deleteDataConfirmModal');
            if (dataModalEl && window.bootstrap && typeof bootstrap.Modal === 'function') {
                dataDeleteModal = new bootstrap.Modal(dataModalEl);
            } else {
                dataDeleteModal = null;
            }
        } catch (e) {
            console.error('Error initializing data delete modal', e);
            dataDeleteModal = null;
        }

        document.querySelectorAll('.delete-data-btn').forEach(function (btn) {
            if (btn.__data_delete_init) return;
            btn.__data_delete_init = true;
            btn.addEventListener('click', function (ev) {
                ev.preventDefault();
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
                    try { currentDataItemEl.remove(); } catch (e) { currentDataItemEl.style.display = 'none'; }
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
    window.UnifiedDashboardModules.delete = { initDeleteHandlers, deleteKpi: null };
})();
