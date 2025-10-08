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
