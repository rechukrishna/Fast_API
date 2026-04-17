"""Auth / login API tests (mirror tests/api/login.robot)."""

from api_helpers import api_url, authed_session, login, reset_database


def test_login_valid_returns_token():
    base = api_url()
    reset_database(base)
    r = login(base, "alice@example.com", "password123")
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data.get("token_type") == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "alice@example.com"


def test_login_invalid_password_401():
    base = api_url()
    reset_database(base)
    r = login(base, "alice@example.com", "wrongpassword")
    assert r.status_code == 401
    assert "Incorrect email or password" in r.json()["detail"]


def test_login_unknown_email_401():
    base = api_url()
    reset_database(base)
    r = login(base, "nobody@example.com", "password123")
    assert r.status_code == 401
    assert "Incorrect email or password" in r.json()["detail"]


def test_get_auth_token_helper():
    base = api_url()
    reset_database(base)
    s = authed_session(base, "bob@example.com", "password123")
    r = s.get(f"{base}/users/2")
    assert r.status_code == 200
