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
                    if (! confirm(message)) {
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
