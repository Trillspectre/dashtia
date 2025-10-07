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
