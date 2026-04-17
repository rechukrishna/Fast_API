"""Products API tests (mirror tests/api/products.robot)."""

from __future__ import annotations

import pytest
import requests

from api_helpers import api_url, authed_session, load_test_json, reset_database


@pytest.fixture(scope="module")
def products_suite() -> tuple[requests.Session, str, list[int]]:
    base = api_url()
    reset_database(base)
    s = authed_session(base)
    created: list[int] = []
    for row in load_test_json("products.json"):
        r = s.post(f"{base}/products", json=row)
        assert r.status_code == 201, r.text
        created.append(r.json()["id"])
    yield s, base, created
    for pid in created:
        try:
            dr = s.delete(f"{base}/products/{pid}")
            assert dr.status_code in (204, 404)
        except Exception:
            pass


def test_list_products_seed_and_suite_data(products_suite):
    s, base, _ = products_suite
    r = s.get(f"{base}/products")
    assert r.status_code == 200
    products = r.json()
    assert len(products) == 13
    names = {p["name"] for p in products}
    for n in ("Laptop Pro 15", "Test Product", "Suite Test Widget", "API Test Gadget"):
        assert n in names


def test_get_product_by_id(products_suite):
    s, base, _ = products_suite
    r = s.get(f"{base}/products/1")
    assert r.status_code == 200
    p = r.json()
    assert p["name"] == "Laptop Pro 15"
    for key in ("id", "price", "stock"):
        assert key in p


def test_get_product_not_found_404(products_suite):
    s, base, _ = products_suite
    r = s.get(f"{base}/products/99999")
    assert r.status_code == 404
    assert "Product not found" in r.json()["detail"]


def test_post_product_creates(products_suite):
    s, base, created = products_suite
    body = {"name": "New Product", "price": 299.99, "stock": 15}
    r = s.post(f"{base}/products", json=body)
    assert r.status_code == 201
    p = r.json()
    created.append(p["id"])
    assert p["name"] == "New Product"
    assert float(p["price"]) == 299.99
    assert p["stock"] == 15
    assert "id" in p
