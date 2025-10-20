from django import template
import re

register = template.Library()


@register.filter(is_safe=True)
def unwrap_span(value):
    """If value is wrapped in a single outer <span ...>...</span>,
    remove that wrapper.

    Keeps inner HTML intact. Safe to use with |safe in templates.
    """
    if not isinstance(value, str):
        return value
    m = re.match(r"^\s*<span\b[^>]*>(.*)</span>\s*$", value, flags=re.S)
    if m:
        return m.group(1)
    return value
