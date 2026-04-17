"""Users API tests (mirror tests/api/users.robot)."""

from __future__ import annotations

import pytest
import requests

from api_helpers import api_url, authed_session, load_test_json, reset_database


@pytest.fixture(scope="module")
def users_suite() -> tuple[requests.Session, str, list[int]]:
    """Reset DB, seed extra users from JSON, yield session; teardown created rows."""
    base = api_url()
    reset_database(base)
    s = authed_session(base)
    created: list[int] = []
    for row in load_test_json("users.json"):
        r = s.post(f"{base}/users", json=row)
        assert r.status_code == 201, r.text
        created.append(r.json()["id"])
    yield s, base, created
    for uid in created:
        try:
            dr = s.delete(f"{base}/users/{uid}")
            assert dr.status_code in (204, 404)
        except Exception:
            pass


def test_list_users_returns_seed_and_suite_data(users_suite):
    s, base, _ = users_suite
    r = s.get(f"{base}/users")
    assert r.status_code == 200
    users = r.json()
    assert len(users) == 8
    emails = {u["email"] for u in users}
    for e in (
        "alice@example.com",
        "bob@example.com",
        "suite_test@example.com",
        "apitestuser@example.com",
        "suitetester@example.com",
    ):
        assert e in emails


def test_get_user_by_id(users_suite):
    s, base, _ = users_suite
    r = s.get(f"{base}/users/1")
    assert r.status_code == 200
    u = r.json()
    assert u["email"] == "alice@example.com"
    assert u["name"] == "Alice Johnson"
    assert "id" in u


def test_get_user_not_found_404(users_suite):
    s, base, _ = users_suite
    r = s.get(f"{base}/users/99999")
    assert r.status_code == 404
    assert "User not found" in r.json()["detail"]


def test_post_user_creates(users_suite):
    s, base, created = users_suite
    body = {"name": "New User", "email": "newuser@example.com", "password": "secret123"}
    r = s.post(f"{base}/users", json=body)
    assert r.status_code == 201
    data = r.json()
    created.append(data["id"])
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data


def test_post_user_duplicate_email_409(users_suite):
    s, base, _ = users_suite
    body = {"name": "Duplicate", "email": "alice@example.com", "password": "secret123"}
    r = s.post(f"{base}/users", json=body)
    assert r.status_code == 409
    assert "already exists" in r.json()["detail"]
