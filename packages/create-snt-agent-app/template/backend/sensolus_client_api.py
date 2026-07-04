"""Sensolus public REST API client.

Wraps authenticated requests to the Sensolus API for the Flask backend.
Endpoint inputs are validated so they cannot escape the configured base URL
(no absolute URLs, protocol-relative URLs, path traversal, or query/fragment
injection). Cross-host redirects are also disabled.
"""
import logging
import os
import re

import requests
from flask import request, session
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

SENSOLUS_DOMAIN = os.environ.get("SENSOLUS_DOMAIN", "cloud.sensolus.com")
SENSOLUS_BASE_URL = f"https://{SENSOLUS_DOMAIN}/rest/api/v2"
SENSOLUS_COOKIE_NAME = os.environ.get("SENSOLUS_COOKIE_NAME", "prod-sensolus-token")

# Endpoints are conservative relative paths: alphanumerics plus '/', '-', '_', '.'.
# Query strings are built separately from the params dict — not part of endpoint.
_ALLOWED_ENDPOINT_RE = re.compile(r'^/[A-Za-z0-9/_\-.]*$')

_EXPECTED_HOST = urlparse(SENSOLUS_BASE_URL).hostname


def _sanitize_endpoint(endpoint):
    """Validate the endpoint is a safe relative path under the Sensolus API base.

    Rejects absolute URLs, protocol-relative URLs, path traversal, query/fragment
    in the endpoint, and any characters outside a conservative allowlist. This
    guarantees the final URL stays on the configured Sensolus host.
    """
    if not isinstance(endpoint, str) or not endpoint:
        raise ValueError("endpoint must be a non-empty string")
    if not endpoint.startswith('/') or endpoint.startswith('//'):
        raise ValueError(f"endpoint must be a single-slash relative path: {endpoint!r}")
    if '..' in endpoint:
        raise ValueError(f"endpoint must not contain '..': {endpoint!r}")
    if '?' in endpoint or '#' in endpoint or '\\' in endpoint:
        raise ValueError("endpoint must not contain '?', '#' or '\\'; use params for query strings")
    if not _ALLOWED_ENDPOINT_RE.match(endpoint):
        raise ValueError(f"endpoint contains invalid characters: {endpoint!r}")
    return endpoint


def get_auth_headers_and_params():
    """
    Get authentication headers and params for Sensolus API calls.

    Priority:
    1. Session cookie (SENSOLUS_COOKIE_NAME) -> passed as Bearer token
    2. API key from query parameter -> passed as apiKey query param
    3. Stored API key from session -> passed as apiKey query param

    Returns:
        tuple: (headers dict, params dict, error message or None)
    """
    headers = {}
    params = {}

    # Check for session cookie first - pass as Bearer token
    token = request.cookies.get(SENSOLUS_COOKIE_NAME)
    if token:
        headers['Authorization'] = f'Bearer {token}'
        logger.info("Using session cookie as Bearer token for authentication")
        return headers, params, None

    # Check for API key in query parameter
    api_key = request.args.get('apiKey')
    if api_key:
        # Store API key in session for future requests
        session['api_key'] = api_key
        params['apiKey'] = api_key
        logger.info("Using API key from query parameter")
        return headers, params, None

    # Check for useCookie flag without actual cookie
    if request.args.get('useCookie') == 'true':
        logger.warning("useCookie=true but no session token found")
        return None, None, "No session token found in cookies"

    # Try to use stored API key from session
    stored_api_key = session.get('api_key')
    if stored_api_key:
        params['apiKey'] = stored_api_key
        logger.info("Using stored API key from session")
        return headers, params, None

    logger.warning("No authentication method available")
    return None, None, "API key is required"


def make_sensolus_request(endpoint, extra_params=None, method='GET', json_body=None):
    """
    Make an authenticated request to the Sensolus API.

    Args:
        endpoint: API endpoint relative to SENSOLUS_BASE_URL (e.g., '/organisations').
            Validated against a strict allowlist — absolute URLs, protocol-relative
            URLs, path traversal, and query/fragment characters are rejected.
        extra_params: Additional query parameters
        method: HTTP method ('GET' or 'POST')
        json_body: JSON body for POST requests

    Returns:
        tuple: (response_data, status_code)
    """
    try:
        endpoint = _sanitize_endpoint(endpoint)
    except ValueError as e:
        logger.error(f"Rejected unsafe endpoint: {e}")
        return {"error": "Invalid API endpoint"}, 400

    headers, params, error = get_auth_headers_and_params()

    if error:
        return {"error": error}, 401 if "session token" in error else 400

    if extra_params:
        params.update(extra_params)

    url = f"{SENSOLUS_BASE_URL}{endpoint}"

    # Defence in depth: even though endpoint is sanitized, re-parse and verify
    # the final URL still points at the expected Sensolus host before sending.
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname != _EXPECTED_HOST:
        logger.error(f"Refusing to send request to unexpected host: {parsed.hostname}")
        return {"error": "Invalid API endpoint"}, 400

    # Log the request (mask sensitive data)
    log_params = {k: '***' if k == 'apiKey' else v for k, v in params.items()}
    log_headers = {k: '***' if k == 'Authorization' else v for k, v in headers.items()}
    logger.info(f"API Request: {method} {url}")
    logger.info(f"  Headers: {log_headers}")
    logger.info(f"  Params: {log_params}")
    if json_body:
        logger.info(f"  Body: {json_body}")

    try:
        if method == 'POST':
            headers['Content-Type'] = 'application/json'
            response = requests.post(
                url,
                params=params,
                headers=headers,
                json=json_body,
                timeout=30,
                allow_redirects=False,
            )
        else:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=30,
                allow_redirects=False,
            )

        logger.info(f"API Response: {response.status_code} from {endpoint}")

        # Block server-initiated redirects — we will not chase the Sensolus API
        # off to another host or path under any circumstances.
        if 300 <= response.status_code < 400:
            logger.error(f"Refusing to follow redirect from {endpoint} to {response.headers.get('Location')!r}")
            return {"error": "Upstream redirect refused"}, 502

        if response.status_code >= 400:
            logger.error(f"API Error: {response.status_code} - {response.text[:500]}")

        response.raise_for_status()
        return response.json(), 200

    except requests.exceptions.HTTPError as e:
        error_msg = f"API error: {e.response.status_code}"
        if e.response.text:
            try:
                error_detail = e.response.json()
                error_msg = f"{error_msg} - {error_detail.get('message', e.response.text[:200])}"
            except Exception:
                error_msg = f"{error_msg} - {e.response.text[:200]}"
        logger.error(f"HTTP Error on {endpoint}: {error_msg}")
        return {"error": error_msg}, e.response.status_code

    except requests.exceptions.RequestException as e:
        logger.error(f"Request Exception on {endpoint}: {str(e)}")
        return {"error": str(e)}, 500
