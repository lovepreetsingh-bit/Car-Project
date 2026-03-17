from collections.abc import Callable

import pytest
from playwright.sync_api import Playwright, sync_playwright

from pages.add_car_page import AddCarPage
from pages.car_details_page import CarDetailsPage
from pages.home_page import HomePage
from utils.api_client import CarApiClient
from utils.test_data import build_car_payload


BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:5000/api/"


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    with sync_playwright() as playwright:
        yield playwright


@pytest.fixture(scope="session")
def browser(playwright_instance: Playwright, pytestconfig):
    try:
        headed = pytestconfig.getoption("headed")
    except Exception:
        headed = False

    try:
        slow_mo = pytestconfig.getoption("slowmo")
    except Exception:
        slow_mo = 0

    browser = playwright_instance.chromium.launch(
        headless=not headed,
        slow_mo=slow_mo,
    )
    yield browser
    browser.close()


@pytest.fixture()
def context(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    yield context
    context.close()


@pytest.fixture()
def page(context):
    page = context.new_page()
    yield page


@pytest.fixture(scope="session")
def api_request_context(playwright_instance: Playwright):
    request_context = playwright_instance.request.new_context(base_url=API_URL)
    yield request_context
    request_context.dispose()


@pytest.fixture()
def api_client(api_request_context):
    return CarApiClient(api_request_context)


@pytest.fixture()
def home_page(page):
    return HomePage(page, BASE_URL)


@pytest.fixture()
def add_car_page(page):
    return AddCarPage(page, BASE_URL)


@pytest.fixture()
def car_details_page(page):
    return CarDetailsPage(page, BASE_URL)


@pytest.fixture()
def created_car_ids():
    return []


@pytest.fixture()
def car_factory(api_client, created_car_ids) -> Callable:
    def _create_car(**overrides):
        car = api_client.create_car(build_car_payload(**overrides))
        created_car_ids.append(car["_id"])
        return car

    return _create_car


@pytest.fixture()
def track_created_car_by_title(api_client, created_car_ids) -> Callable:
    def _track(title: str):
        for car in api_client.list_cars():
            if car["title"] == title and car["_id"] not in created_car_ids:
                created_car_ids.append(car["_id"])

    return _track


@pytest.fixture(autouse=True)
def cleanup_created_cars(api_client, created_car_ids):
    yield
    for car_id in reversed(created_car_ids):
        response = api_client.delete_car(car_id, expect_ok=False)
        if response.status not in (200, 404):
            print(f"Cleanup warning: unable to delete car {car_id}. Status {response.status}")
