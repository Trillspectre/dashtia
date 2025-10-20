(function(){
    // Centralized small initializers for marketing pages (pricing, about, sales)
    function initShowMoreButtons(){
        try{
            document.querySelectorAll('.show-more-btn').forEach(function (btn) {
                if (btn.__show_more_initialized) return;
                btn.__show_more_initialized = true;
                btn.addEventListener('click', function () {
                    const cardBody = btn.closest('.card-body');
                    const content = cardBody && cardBody.querySelector('.card-content');
                    if (!content) return;
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
        } catch (e) { /* non-fatal */ }
    }

    try { if (document && document.readyState !== 'loading') initShowMoreButtons(); else document.addEventListener('DOMContentLoaded', initShowMoreButtons); } catch(e){}
})();
