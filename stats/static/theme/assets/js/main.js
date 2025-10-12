// theme main.js (no console output in production)
//===== Prealoder

window.onload = function () {
	window.setTimeout(fadeout, 500);
}

// Mark 'stats' pages with a body class so we can scope CSS for admin/dashboard views
try {
	if (window.location && window.location.pathname && window.location.pathname.indexOf('/stats') === 0) {
		document.documentElement.classList.add('stats-page');
		// Also add to body for easier CSS targeting
		try { document.body.classList.add('stats-page'); } catch(e){}
	}
} catch(e) { /* ignore */ }

function fadeout() {
	document.querySelector('.preloader').style.opacity = '0';
	document.querySelector('.preloader').style.display = 'none';
}


/*=====================================
Sticky
======================================= */
window.onscroll = function () {
	var header_navbar = document.querySelector(".navbar-area");
	var logo = document.querySelector('.navbar-brand img');

	// Defensive guards: don't attempt to read offsetTop or change logo if elements are missing
	var sticky = null;
	if (header_navbar) {
		try {
			sticky = header_navbar.offsetTop;
		} catch (e) {
			sticky = null;
		}
	}

	if (sticky !== null && window.pageYOffset > sticky) {
		header_navbar.classList.add("sticky");
		if (logo && logo.dataset && logo.dataset.logoSticky) {
			logo.src = logo.dataset.logoSticky;
		}
	} else if (header_navbar) {
		header_navbar.classList.remove("sticky");
		// Only switch back to a different default if it exists and differs from the current src
		if (logo && logo.dataset && logo.dataset.logoDefault) {
			try {
				if (logo.src && logo.dataset.logoDefault && (logo.src.indexOf(logo.dataset.logoDefault) === -1)) {
					logo.src = logo.dataset.logoDefault;
				}
			} catch (e) { /* ignore URL comparison errors */ }
		}
	}



	// show or hide the back-top-top button
	var backToTo = document.querySelector(".scroll-top");
	if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
		backToTo.style.display = "flex";
	} else {
		backToTo.style.display = "none";
	}
};


// section menu active
function onScroll(event) {
	var sections = document.querySelectorAll('.page-scroll');
	var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

	for (var i = 0; i < sections.length; i++) {
		var currLink = sections[i];
		var val = currLink.getAttribute('href');
		var refElement = null;
		try {
			refElement = document.querySelector(val);
		} catch (e) {
			refElement = null;
		}
		var scrollTopMinus = scrollPos + 73;
		if (refElement && typeof refElement.offsetTop !== 'undefined' && (refElement.offsetTop <= scrollTopMinus && (refElement.offsetTop + refElement.offsetHeight > scrollTopMinus))) {
			var prevActive = document.querySelector('.page-scroll.active');
			if (prevActive) prevActive.classList.remove('active');
			currLink.classList.add('active');
		} else {
			currLink.classList.remove('active');
		}
	}
};

window.document.addEventListener('scroll', onScroll);



//===== close navbar-collapse when a  clicked
let navbarToggler = document.querySelector(".navbar-toggler");
var navbarCollapse = document.querySelector(".navbar-collapse");

document.querySelectorAll(".page-scroll").forEach(e =>
	e.addEventListener("click", () => {
		navbarToggler.classList.remove("active");
		navbarCollapse.classList.remove('show')
	})
);
navbarToggler.addEventListener('click', function () {
	navbarToggler.classList.toggle("active");
});

//====== counter up 
var cu = new counterUp({
	start: 0,
	duration: 2000,
	intvalues: true,
	interval: 100,
	append: 'K'
});
cu.start();

// WOW active
new WOW().init();