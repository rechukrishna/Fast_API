"""HTTP helpers for pytest API tests (same contract as Robot api_resources.robot)."""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

import requests

TEST_DATA = Path(__file__).resolve().parent.parent / "test_data"
LOGGER = logging.getLogger("api_tests")


def _trim(text: str, limit: int = 240) -> str:
    text = (text or "").replace("\n", " ").strip()
    if len(text) <= limit:
        return text
    return f"{text[:limit]}..."


def _log_response(resp: requests.Response, context: str) -> None:
    req = resp.request
    LOGGER.info(
        "%s | %s %s -> %s | body=%s",
        context,
        req.method,
        req.url,
        resp.status_code,
        _trim(resp.text),
    )


def api_url() -> str:
    return os.environ.get("API_URL", "http://localhost:8000").rstrip("/")


def load_test_json(name: str) -> Any:
    with open(TEST_DATA / name, encoding="utf-8") as f:
        return json.load(f)


def reset_database(base: str | None = None) -> None:
    b = base or api_url()
    LOGGER.info("reset_database | POST %s/test/reset", b)
    r = requests.post(f"{b}/test/reset", timeout=60)
    _log_response(r, "reset_database")
    r.raise_for_status()


def login(base: str, email: str, password: str) -> requests.Response:
    LOGGER.info("login | POST %s/auth/login | email=%s", base, email)
    resp = requests.post(
        f"{base}/auth/login",
        json={"email": email, "password": password},
        timeout=60,
    )
    _log_response(resp, "login")
    return resp


def authed_session(
    base: str,
    email: str = "alice@example.com",
    password: str = "password123",
) -> requests.Session:
    resp = login(base, email, password)
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}"})

    def _response_hook(response: requests.Response, *args: Any, **kwargs: Any) -> None:
        _log_response(response, "session")

    s.hooks["response"] = [_response_hook]
    LOGGER.info("authed_session | created authenticated session for %s", email)
    return s
