from django.utils.deprecation import MiddlewareMixin


class AllowAmiresponsiveFrameMiddleware(MiddlewareMixin):
    """Temporary middleware to allow amiresponsive to frame the site.

    This removes the X-Frame-Options header and sets a Content-Security-Policy
    frame-ancestors directive allowing the monitoring host. Only enable this
    temporarily for testing; prefer restricting to the exact hostname.
    """

    # Replace this with the exact origin used by the testing tool
    ALLOWED_FRAME_ORIGINS = [
        "https://ui.dev",
        "https://ami.responsivedesign.is",
        "https://amirespon.si",
        # Add other monitoring domains here as needed
    ]

    def process_response(self, request, response):
        # If the response already has a CSP frame-ancestors, don't override
        if "Content-Security-Policy" in response:
            # Append frame-ancestors if not present (simple approach)
            csp = response["Content-Security-Policy"]
            if "frame-ancestors" not in csp:
                allowed = "'self' " + " ".join(self.ALLOWED_FRAME_ORIGINS)
                response["Content-Security-Policy"] = (
                    csp + "; frame-ancestors %s" % allowed
                )
        else:
            allowed = "'self' " + " ".join(self.ALLOWED_FRAME_ORIGINS)
            response["Content-Security-Policy"] = f"frame-ancestors {allowed}"

        # Remove X-Frame-Options to avoid conflicting directives
        if "X-Frame-Options" in response:
            del response["X-Frame-Options"]

        return response
