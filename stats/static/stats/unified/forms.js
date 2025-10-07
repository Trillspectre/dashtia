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

    window.UnifiedDashboardModules.forms = { getCSRFCookie, attachCustomUnitHandlers };
})();
