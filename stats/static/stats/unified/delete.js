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
        let deleteModal = null;
        try {
            if (window.bootstrap && typeof bootstrap.Modal === 'function') {
                deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            }
        } catch (e) {
            console.error('Error initializing bootstrap modal', e);
            deleteModal = null;
        }

        document.querySelectorAll('.delete-kpi-btn').forEach(function (btn) {
            if (btn.__delete_initialized) return;
            btn.__delete_initialized = true;
            btn.addEventListener('click', function () {
                currentKpiId = btn.getAttribute('data-kpi-id');
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
            const btnRef = document.querySelector(`.delete-kpi-btn[data-kpi-id="${currentKpiId}"]`);
            const deleteUrl = btnRef ? btnRef.getAttribute('data-delete-url') : `/stats/${currentKpiId}/delete/`;

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
                    const btn = btnRef || document.querySelector(`.delete-kpi-btn[data-kpi-id="${currentKpiId}"]`);
                    if (btn) {
                        let card = btn.closest('.col-md-6') || btn.closest('.card') || btn.parentElement;
                        if (card && card.remove) {
                            card.remove();
                        } else {
                            console.warn('Could not remove card node, reloading page as fallback');
                            window.location.reload();
                        }
                    } else {
                        console.warn('Delete button element not found after successful delete, reloading');
                        window.location.reload();
                    }
                    ui && ui.showToast && ui.showToast('KPI deleted (soft-delete)');
                        try {
                            if (window.UnifiedDashboardModules && window.UnifiedDashboardModules.chart && typeof window.UnifiedDashboardModules.chart.updateChart === 'function') {
                                window.UnifiedDashboardModules.chart.updateChart();
                            }
                        } catch (e) { console.warn('chart update after data delete failed', e); }
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
            });
        });
    }

    window.UnifiedDashboardModules = window.UnifiedDashboardModules || {};
    window.UnifiedDashboardModules.delete = { initDeleteHandlers, deleteKpi: null };
})();
