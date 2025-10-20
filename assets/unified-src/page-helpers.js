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
        ,
        initGlobalUi() {
            // Defensive modal wiring and collapse fallback previously in base_theme.html
            // debugLog removed in production

            function maybeShowModalById(id){
                const modalEl = document.getElementById(id);
                if (!modalEl) return false;
                if (window.bootstrap && typeof bootstrap.Modal === 'function'){
                    try{ const inst = bootstrap.Modal.getOrCreateInstance(modalEl); inst.show(); debugLog('bootstrap.Modal.show ->', id); return true; } catch(e){ debugLog('bootstrap show error', e); }
                }
                try{
                    modalEl.classList.add('show'); modalEl.style.display = 'block'; modalEl.setAttribute('aria-modal','true'); modalEl.removeAttribute('aria-hidden');
                    let bd = document.querySelector('.manual-modal-backdrop'); if (!bd){ bd = document.createElement('div'); bd.className = 'manual-modal-backdrop'; bd.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1040;'; document.body.appendChild(bd); }
                    modalEl.style.zIndex = 1050; debugLog('manual show ->', id); return true;
                }catch(e){ debugLog('manual modal show failed', e); }
                return false;
            }

            function maybeHideModalById(id){
                const modalEl = document.getElementById(id); if (!modalEl) return false;
                if (window.bootstrap && typeof bootstrap.Modal === 'function'){
                    try{ const inst = bootstrap.Modal.getInstance(modalEl); if (inst) { inst.hide(); debugLog('bootstrap.Modal.hide ->', id); return true; } } catch(e){ debugLog('bootstrap hide error', e); }
                }
                try{ modalEl.classList.remove('show'); modalEl.style.display = 'none'; modalEl.setAttribute('aria-hidden','true'); modalEl.removeAttribute('aria-modal'); const bd = document.querySelector('.manual-modal-backdrop'); if (bd) bd.remove(); debugLog('manual hide ->', id); return true; }catch(e){ debugLog('manual modal hide failed', e); }
                return false;
            }

            function toggleCollapseById(id){
                const el = document.getElementById(id); if (!el) return false;
                if (window.bootstrap && typeof bootstrap.Collapse === 'function'){
                    try{ const inst = bootstrap.Collapse.getOrCreateInstance(el); inst.toggle(); return true; }catch(e){}
                }
                const isShown = el.classList.contains('show');
                if (isShown){ el.classList.remove('show'); el.style.display = 'none'; el.setAttribute('aria-hidden','true'); el.setAttribute('aria-expanded','false'); }
                else { el.classList.add('show'); el.style.display = 'block'; el.setAttribute('aria-hidden','false'); el.setAttribute('aria-expanded','true'); }
                return true;
            }

            try{
                document.addEventListener('click', function(ev){
                    // Support both Bootstrap 5 (data-bs-*) and legacy data-* attributes
                    const addBtn = (ev.target.closest && (ev.target.closest('[data-team-id][data-bs-target="#addMemberModal"]') || ev.target.closest('[data-team-id][data-target="#addMemberModal"]')));
                    if (addBtn){ ev.preventDefault(); const teamId = addBtn.getAttribute('data-team-id'); const teamName = addBtn.getAttribute('data-team-name') || ''; const idEl = document.getElementById('member_team_id'); const nameEl = document.getElementById('member_team_name'); if (idEl) idEl.value = teamId; if (nameEl) nameEl.textContent = teamName; debugLog('Add Member clicked', {teamId, teamName}); maybeShowModalById('addMemberModal'); return; }

                    const createBtn = (ev.target.closest && (ev.target.closest('[data-bs-target="#createTeamModal"]') || ev.target.closest('[data-target="#createTeamModal"]') || ev.target.closest('button[data-bs-target="#createTeamModal"]') || ev.target.closest('button[data-target="#createTeamModal"]')));
                    if (createBtn){ ev.preventDefault(); debugLog('Create Team clicked'); maybeShowModalById('createTeamModal'); return; }

                    const dismissBtn = ev.target.closest && ev.target.closest('[data-bs-dismiss],[data-dismiss]');
                    if (dismissBtn){ const modalAncestor = ev.target.closest && ev.target.closest('.modal'); if (modalAncestor) maybeHideModalById(modalAncestor.id); }

                }, {capture: true});
            } catch(e){}

            try{
                document.addEventListener('click', function(ev){
                    const btn = ev.target.closest && (ev.target.closest('[data-bs-toggle="collapse"][data-bs-target]') || ev.target.closest('[data-toggle="collapse"][data-target]'));
                    if (!btn) return;
                    const target = btn.getAttribute('data-bs-target') || btn.getAttribute('data-target') || btn.getAttribute('href');
                    if (!target) return; const id = (target.charAt(0) === '#') ? target.slice(1) : target; setTimeout(function(){ toggleCollapseById(id); }, 0);
                }, {capture: true});
            } catch(e){}
        },

        initLogin() {
            // Back button/page cache handling
            try {
                // Modern navigation timing if available
                const navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation') && performance.getEntriesByType('navigation')[0]) || null;
                const isBack = navEntry ? (navEntry.type === 'back_forward') : (performance.navigation && performance.navigation.type === 2);
                if (isBack) window.location.reload(true);
            } catch(e){}

            try {
                window.addEventListener('pageshow', function(event) {
                    if (event.persisted) {
                        window.location.reload();
                    }
                });
            } catch(e){}
        }
    };

    window.UnifiedDashboardModules.pageHelpers = helpers;
})();
