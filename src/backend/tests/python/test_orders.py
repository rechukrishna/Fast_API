"""Orders API tests (mirror tests/api/orders.robot)."""

from __future__ import annotations

import pytest
import requests

from api_helpers import api_url, authed_session, load_test_json, reset_database


@pytest.fixture(scope="module")
def orders_suite() -> tuple[requests.Session, str, list[int]]:
    base = api_url()
    reset_database(base)
    s = authed_session(base)
    created: list[int] = []
    for row in load_test_json("orders.json"):
        r = s.post(f"{base}/orders", json=row)
        assert r.status_code == 201, r.text
        created.append(r.json()["id"])
    yield s, base, created
    for oid in created:
        try:
            dr = s.delete(f"{base}/orders/{oid}")
            assert dr.status_code in (204, 404)
        except Exception:
            pass


def test_list_orders_seed_and_suite_data(orders_suite):
    s, base, _ = orders_suite
    r = s.get(f"{base}/orders")
    assert r.status_code == 200
    orders = r.json()
    assert len(orders) == 8
    assert len({o["id"] for o in orders}) == 8


def test_get_order_by_id(orders_suite):
    s, base, _ = orders_suite
    r = s.get(f"{base}/orders/1")
    assert r.status_code == 200
    o = r.json()
    assert o["user_id"] == 1
    assert o["product_id"] == 1
    for key in ("id", "status"):
        assert key in o


def test_get_order_not_found_404(orders_suite):
    s, base, _ = orders_suite
    r = s.get(f"{base}/orders/99999")
    assert r.status_code == 404
    assert "Order not found" in r.json()["detail"]


def test_post_order_creates(orders_suite):
    s, base, created = orders_suite
    body = {"user_id": 1, "product_id": 1, "quantity": 5, "status": "pending"}
    r = s.post(f"{base}/orders", json=body)
    assert r.status_code == 201
    o = r.json()
    created.append(o["id"])
    assert o["user_id"] == 1
    assert o["product_id"] == 1
    assert o["quantity"] == 5
    assert o["status"] == "pending"
    assert "id" in o


def test_post_order_invalid_user_400(orders_suite):
    s, base, _ = orders_suite
    body = {"user_id": 99999, "product_id": 1, "quantity": 1, "status": "pending"}
    r = s.post(f"{base}/orders", json=body)
    assert r.status_code == 400
    assert "Invalid user or product" in r.json()["detail"]


def test_post_order_invalid_product_400(orders_suite):
    s, base, _ = orders_suite
    body = {"user_id": 1, "product_id": 99999, "quantity": 1, "status": "pending"}
    r = s.post(f"{base}/orders", json=body)
    assert r.status_code == 400
    assert "Invalid user or product" in r.json()["detail"]
