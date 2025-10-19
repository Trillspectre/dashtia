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
                <div class="card h-100 kpi-card" data-kpi-slug="${kpi.slug}" style="cursor: pointer;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${kpi.name}</h6>
                            <span class="badge bg-primary">${kpi.chart_type}</span>
                        </div>
                        <p class="text-muted small mb-2"><i class="fas fa-user"></i> Created by: ${kpi.owner}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted"><i class="fas fa-chart-bar"></i> ${kpi.data_count} data points</small>
                            <button class="btn btn-outline-primary btn-sm"><i class="fas fa-eye"></i> View</button>
                        </div>
                    </div>
                </div>
            `;
            const card = col.querySelector('.kpi-card');
            if (card) card.addEventListener('click', () => kpiListModule.loadKPIDashboard(kpi));
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
                // Prefer a dedicated fragment wrapper if present; fall back to the
                // dashboard heading proximity, then to the page container.
                let dashboardFragment = temp.querySelector('#kpi-fragment');
                if (!dashboardFragment) {
                    const heading = temp.querySelector('#dashboard-name');
                    if (heading) dashboardFragment = heading.closest('.row') || heading.parentElement;
                }
                if (!dashboardFragment) {
                    dashboardFragment = temp.querySelector('.container') || temp.querySelector('main') || temp;
                }
                const dashboardContent = document.getElementById('dashboard-content');
                if (dashboardContent) dashboardContent.innerHTML = dashboardFragment.innerHTML;
                if (typeof window.initializeDashboardScripts === 'function') window.initializeDashboardScripts(kpi.slug);
                if (typeof window.showDashboard === 'function') window.showDashboard();
            } catch (err) {
                console.error('Error loading KPI dashboard:', err);
                ui && ui.showError && ui.showError('Failed to load KPI dashboard. Please try again.');
            }
        }
    };

    window.UnifiedDashboardModules.kpiList = kpiListModule;
    // auto-init in dev mode when loaded directly
    try { if (document && document.readyState !== 'loading') kpiListModule.initSelector(); else document.addEventListener('DOMContentLoaded', () => kpiListModule.initSelector()); } catch(e){}
})();
