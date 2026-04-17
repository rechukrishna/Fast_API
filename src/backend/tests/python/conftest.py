"""Pytest fixtures for API tests."""

from __future__ import annotations

import pytest
import requests

from api_helpers import api_url, authed_session, reset_database


def pytest_sessionstart(session: pytest.Session) -> None:
    """Skip API tests with a clear message when the backend is not running."""
    cfg = session.config
    base = api_url()
    try:
        requests.get(f"{base}/", timeout=5).raise_for_status()
        cfg._api_live = True  # noqa: SLF001
    except Exception as exc:  # noqa: BLE001 — surface connection errors to skip reason
        cfg._api_live = False  # noqa: SLF001
        cfg._api_err = exc  # noqa: SLF001


def pytest_runtest_setup(item: pytest.Item) -> None:
    cfg = item.session.config
    if getattr(cfg, "_api_live", False):
        return
    err = getattr(cfg, "_api_err", None)
    pytest.skip(
        f"API not reachable at {api_url()}: {err!r}. "
        "Start the stack from src/backend: docker-compose up -d"
    )


@pytest.fixture
def base_url() -> str:
    return api_url()


@pytest.fixture
def reset_base(base_url: str) -> str:
    reset_database(base_url)
    return base_url


@pytest.fixture
def session(reset_base: str) -> requests.Session:
    return authed_session(reset_base)
