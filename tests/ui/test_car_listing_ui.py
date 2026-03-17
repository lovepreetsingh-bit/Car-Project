import json

import pytest
from playwright.sync_api import expect

from locators.car_locators import AddCarPageLocators, CarDetailsPageLocators, HomePageLocators
from pages.add_car_page import AddCarPage
from pages.home_page import HomePage
from utils.test_data import build_car_payload


def handle_all_dialogs(page, messages: list[str]):
    def _handler(dialog):
        messages.append(dialog.message)
        dialog.accept()

    page.on("dialog", _handler)
    return _handler


def remove_dialog_handler(page, handler):
    page.remove_listener("dialog", handler)


def assert_listing_visible_on_home(home_page, title: str):
    home_page.open()
    home_page.wait_until_loaded()
    assert home_page.car_exists(title)


def open_details_for_created_car(home_page, car_details_page, car):
    home_page.open()
    home_page.wait_until_loaded()
    home_page.open_car_details(car["title"])
    car_details_page.wait_until_loaded()


def fill_valid_form_except(add_car_page, missing_selector: str):
    payload = build_car_payload()
    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.fill_field(missing_selector, "")
    return payload


def count_cars_by_title(api_client, title: str) -> int:
    return sum(1 for car in api_client.list_cars() if car["title"] == title)


def mock_car_response(car: dict, is_sold: bool = False) -> str:
    payload = {
        "success": True,
        "data": {
            "_id": car["_id"],
            "title": car["title"],
            "brand": car["brand"],
            "model": car["model"],
            "year": car["year"],
            "price": car["price"],
            "mileage": car["mileage"],
            "description": car["description"],
            "images": car.get("images", []),
            "seller": car["seller"],
            "isSold": is_sold,
            "createdAt": car.get("createdAt", "2026-03-17T00:00:00.000Z"),
        },
    }
    return json.dumps(payload)


def test_ts001_view_all_car_listings_successfully(home_page, car_factory):
    car = car_factory()

    home_page.open()
    home_page.wait_until_loaded()

    expect(home_page.page.locator(HomePageLocators.AVAILABLE_CARS_TITLE)).to_be_visible()
    expect(home_page.get_card_by_title(car["title"])).to_be_visible()


def test_ts002_view_empty_state_when_no_car_listings_exist(home_page):
    home_page.page.route(
        "**/api/cars",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"success": true, "count": 0, "data": []}',
        ),
    )

    home_page.open()
    home_page.wait_until_loaded()

    expect(home_page.page.locator(HomePageLocators.EMPTY_STATE_TEXT)).to_be_visible()


def test_ts003_verify_each_car_card_displays_correct_summary_information(home_page, car_factory):
    car = car_factory()

    home_page.open()
    home_page.wait_until_loaded()

    card = home_page.get_card_by_title(car["title"])
    expect(card).to_contain_text(car["title"])
    expect(card).to_contain_text(f'{car["year"]} {car["brand"]} {car["model"]}')
    expect(card).to_contain_text(f'${car["price"]:,}')
    expect(card).to_contain_text(f'{car["mileage"]:,} km')


def test_ts004_open_car_details_page_from_car_listing(home_page, car_details_page, car_factory):
    car = car_factory()

    open_details_for_created_car(home_page, car_details_page, car)

    expect(car_details_page.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(car["title"])


def test_ts005_verify_car_details_page_shows_complete_car_information(home_page, car_details_page, car_factory):
    car = car_factory()

    open_details_for_created_car(home_page, car_details_page, car)
    page_text = car_details_page.get_page_text()

    assert car["title"] in page_text
    assert car["brand"] in page_text
    assert car["model"] in page_text
    assert str(car["year"]) in page_text
    assert f'${car["price"]:,}' in page_text
    assert f'{car["mileage"]:,} km' in page_text
    assert car["description"] in page_text
    assert car["seller"]["name"] in page_text
    assert car["seller"]["email"] in page_text
    assert car["seller"]["phone"] in page_text


def test_ts006_verify_correct_car_details_are_shown_for_selected_listing(home_page, car_details_page, car_factory):
    first_car = car_factory()
    second_car = car_factory()

    open_details_for_created_car(home_page, car_details_page, first_car)
    first_page_text = car_details_page.get_page_text()
    assert first_car["title"] in first_page_text
    assert second_car["title"] not in first_page_text

    car_details_page.click_back()
    home_page.open_car_details(second_car["title"])
    car_details_page.wait_until_loaded()
    second_page_text = car_details_page.get_page_text()
    assert second_car["title"] in second_page_text
    assert first_car["title"] not in second_page_text


def test_ts007_access_car_details_page_using_direct_valid_url(car_details_page, car_factory):
    car = car_factory()

    car_details_page.open(car["_id"])
    car_details_page.wait_until_loaded()

    expect(car_details_page.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(car["title"])


def test_ts008_access_car_details_page_using_invalid_car_id(car_details_page):
    car_details_page.open("507f1f77bcf86cd799439011")
    car_details_page.wait_until_loaded()

    expect(car_details_page.page.locator(CarDetailsPageLocators.ERROR_BANNER)).to_be_visible()
    expect(car_details_page.page.locator(CarDetailsPageLocators.ERROR_BANNER)).to_contain_text(
        "Failed to fetch car details."
    )


def test_ts009_navigate_to_post_car_page_successfully(home_page, add_car_page):
    home_page.open()
    home_page.click_add_new_car()

    expect(add_car_page.page.locator(AddCarPageLocators.PAGE_TITLE)).to_be_visible()


def test_ts010_add_a_new_car_listing_successfully(add_car_page, home_page, api_client, track_created_car_by_title):
    payload = build_car_payload()
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert any("Car listing created successfully!" in message for message in messages)
    assert count_cars_by_title(api_client, payload["title"]) == 1
    assert_listing_visible_on_home(home_page, payload["title"])


def test_ts011_verify_newly_created_car_is_visible_in_all_car_listings(
    add_car_page, home_page, api_client, track_created_car_by_title
):
    payload = build_car_payload()
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert count_cars_by_title(api_client, payload["title"]) == 1
    assert_listing_visible_on_home(home_page, payload["title"])


def test_ts012_verify_newly_created_car_details_match_submitted_data(
    add_car_page, home_page, car_details_page, track_created_car_by_title
):
    payload = build_car_payload()
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    home_page.wait_until_loaded()
    home_page.open_car_details(payload["title"])
    car_details_page.wait_until_loaded()

    page_text = car_details_page.get_page_text()
    assert payload["title"] in page_text
    assert payload["brand"] in page_text
    assert payload["model"] in page_text
    assert payload["description"] in page_text
    assert payload["seller"]["name"] in page_text
    assert payload["seller"]["email"] in page_text
    assert payload["seller"]["phone"] in page_text


@pytest.mark.parametrize(
    ("scenario_id", "selector"),
    [
        ("TS013", AddCarPageLocators.TITLE_INPUT),
        ("TS014", AddCarPageLocators.BRAND_INPUT),
        ("TS015", AddCarPageLocators.MODEL_INPUT),
        ("TS019", AddCarPageLocators.DESCRIPTION_TEXTAREA),
        ("TS020", AddCarPageLocators.SELLER_NAME_INPUT),
        ("TS021", AddCarPageLocators.SELLER_PHONE_INPUT),
    ],
    ids=lambda value: value if isinstance(value, str) and value.startswith("TS") else None,
)
def test_required_field_validation_scenarios(add_car_page, scenario_id, selector):
    fill_valid_form_except(add_car_page, selector)
    add_car_page.submit()

    assert add_car_page.is_input_invalid(selector), f"{scenario_id} expected invalid field"
    assert add_car_page.get_validation_message(selector) != ""


@pytest.mark.parametrize(
    ("scenario_id", "selector"),
    [
        ("TS016", AddCarPageLocators.YEAR_INPUT),
        ("TS017", AddCarPageLocators.PRICE_INPUT),
        ("TS018", AddCarPageLocators.MILEAGE_INPUT),
    ],
    ids=lambda value: value if isinstance(value, str) and value.startswith("TS") else None,
)
def test_required_numeric_field_validation_scenarios(add_car_page, scenario_id, selector):
    payload = build_car_payload()

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.set_field_via_js(selector, "")
    add_car_page.set_form_no_validate()
    add_car_page.submit()

    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_be_visible()
    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_contain_text(
        "Please fill in all required fields"
    )


def test_ts022_validate_year_accepts_only_valid_numeric_value(add_car_page):
    add_car_page.open()
    add_car_page.set_field_via_js(AddCarPageLocators.YEAR_INPUT, "")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.YEAR_INPUT)
    assert add_car_page.get_validation_message(AddCarPageLocators.YEAR_INPUT) != ""


def test_ts023_validate_price_accepts_only_valid_numeric_value(add_car_page):
    add_car_page.open()
    add_car_page.set_field_via_js(AddCarPageLocators.PRICE_INPUT, "")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.PRICE_INPUT)
    assert add_car_page.get_validation_message(AddCarPageLocators.PRICE_INPUT) != ""


def test_ts024_validate_mileage_accepts_only_valid_numeric_value(add_car_page):
    add_car_page.open()
    add_car_page.set_field_via_js(AddCarPageLocators.MILEAGE_INPUT, "")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.MILEAGE_INPUT)
    assert add_car_page.get_validation_message(AddCarPageLocators.MILEAGE_INPUT) != ""


def test_ts025_validate_negative_year_value_is_rejected(add_car_page):
    add_car_page.open()
    add_car_page.fill_field(AddCarPageLocators.YEAR_INPUT, "-1")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.YEAR_INPUT)


def test_ts026_validate_negative_price_value_is_rejected(add_car_page):
    add_car_page.open()
    add_car_page.fill_field(AddCarPageLocators.PRICE_INPUT, "-10")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.PRICE_INPUT)


def test_ts027_validate_negative_mileage_value_is_rejected(add_car_page):
    add_car_page.open()
    add_car_page.fill_field(AddCarPageLocators.MILEAGE_INPUT, "-10")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.MILEAGE_INPUT)


def test_ts028_validate_future_year_beyond_realistic_range(add_car_page):
    add_car_page.open()
    add_car_page.fill_field(AddCarPageLocators.YEAR_INPUT, "3000")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.YEAR_INPUT)


def test_ts029_validate_extremely_large_price_value_handling(add_car_page, home_page, track_created_car_by_title):
    payload = build_car_payload(price=999999999)
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert any("Car listing created successfully!" in message for message in messages)
    assert_listing_visible_on_home(home_page, payload["title"])


def test_ts030_validate_extremely_large_mileage_value_handling(add_car_page, home_page, track_created_car_by_title):
    payload = build_car_payload(mileage=999999999)
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert any("Car listing created successfully!" in message for message in messages)
    assert_listing_visible_on_home(home_page, payload["title"])


def test_ts031_validate_text_fields_with_leading_and_trailing_spaces(
    add_car_page, home_page, car_details_page, track_created_car_by_title
):
    payload = build_car_payload()
    unique_suffix = payload["title"].split()[-1]
    payload.update(
        {
            "title": f"  Space Title {unique_suffix}  ",
            "brand": f"  SpaceBrand{unique_suffix}  ",
            "model": f"  SpaceModel{unique_suffix}  ",
            "description": "  Space description  ",
        }
    )
    payload["seller"]["name"] = f"  Space Seller {unique_suffix}  "
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(f"Space Title {unique_suffix}")

    home_page.wait_until_loaded()
    home_page.open_car_details(f"Space Title {unique_suffix}")
    car_details_page.wait_until_loaded()

    page_text = car_details_page.get_page_text()
    assert f"Space Title {unique_suffix}" in page_text
    assert f"SpaceBrand{unique_suffix}" in page_text
    assert f"SpaceModel{unique_suffix}" in page_text
    assert f"Space Seller {unique_suffix}" in page_text


def test_ts032_validate_special_characters_in_text_fields(add_car_page, home_page, track_created_car_by_title):
    payload = build_car_payload()
    unique_suffix = payload["title"].split()[-1]
    payload["title"] = f"QA / Car & Co. (Special Edition) {unique_suffix}"
    payload["description"] = "Feature-rich car / low-mileage & road-ready [QA]"
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert_listing_visible_on_home(home_page, payload["title"])


def test_ts033_validate_script_injection_attempt_in_text_fields(
    add_car_page, home_page, car_details_page, track_created_car_by_title
):
    payload = build_car_payload()
    unique_suffix = payload["title"].split()[-1]
    payload["title"] = f"<script>alert('qa')</script> {unique_suffix}"
    payload["description"] = "<img src=x onerror=alert('qa') /> encoded test"
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    home_page.wait_until_loaded()
    home_page.open_car_details(payload["title"])
    car_details_page.wait_until_loaded()

    assert "<script>alert('qa')</script>" in car_details_page.get_page_text()
    assert "<img src=x onerror=alert('qa') /> encoded test" in car_details_page.get_page_text()


def test_ts034_delete_an_unsold_car_listing_successfully(home_page, car_details_page, car_factory):
    car = car_factory()
    messages = []
    handler = handle_all_dialogs(car_details_page.page, messages)

    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.click_delete_listing()
    car_details_page.page.wait_for_url("**/")
    remove_dialog_handler(car_details_page.page, handler)

    assert any("Are you sure you want to delete this listing?" in message for message in messages)
    assert any("Car listing deleted successfully!" in message for message in messages)
    assert not home_page.car_exists(car["title"])


def test_ts035_verify_deleted_car_is_removed_from_details_page_access(home_page, car_details_page, car_factory):
    car = car_factory()
    messages = []
    handler = handle_all_dialogs(car_details_page.page, messages)

    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.click_delete_listing()
    car_details_page.page.wait_for_url("**/")
    remove_dialog_handler(car_details_page.page, handler)

    car_details_page.open(car["_id"])
    car_details_page.wait_until_loaded()
    expect(car_details_page.page.locator(CarDetailsPageLocators.ERROR_BANNER)).to_be_visible()


def test_ts036_attempt_to_delete_a_sold_car_listing(car_details_page, car_factory):
    car = car_factory()

    car_details_page.page.route(
        f"**/api/cars/{car['_id']}",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=mock_car_response(car, is_sold=True),
        ),
    )

    car_details_page.open(car["_id"])
    car_details_page.wait_until_loaded()

    assert not car_details_page.is_delete_button_visible()
    expect(car_details_page.page.locator(CarDetailsPageLocators.SOLD_BADGE)).to_be_visible()


def test_ts037_cancel_delete_action_from_confirmation_dialog(home_page, car_details_page, car_factory):
    car = car_factory()

    def dismiss_dialog(dialog):
        dialog.dismiss()

    car_details_page.page.on("dialog", dismiss_dialog)
    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.click_delete_listing()
    car_details_page.page.wait_for_timeout(1000)
    car_details_page.page.remove_listener("dialog", dismiss_dialog)

    assert car_details_page.page.url.endswith(f"/car/{car['_id']}")


def test_ts038_verify_form_retains_data_after_validation_failure(add_car_page):
    payload = build_car_payload()

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.fill_field(AddCarPageLocators.TITLE_INPUT, "")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.TITLE_INPUT)
    assert add_car_page.get_input_value(AddCarPageLocators.BRAND_INPUT) == payload["brand"]
    assert add_car_page.get_input_value(AddCarPageLocators.MODEL_INPUT) == payload["model"]
    assert add_car_page.get_input_value(AddCarPageLocators.SELLER_NAME_INPUT) == payload["seller"]["name"]


def test_ts039_verify_submit_button_behavior_on_repeated_clicks(
    add_car_page, api_client, track_created_car_by_title
):
    payload = build_car_payload()
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.page.locator(AddCarPageLocators.CREATE_LISTING_BUTTON).dblclick()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    assert count_cars_by_title(api_client, payload["title"]) == 1


def test_ts040_verify_homepage_layout_on_desktop_screen(home_page):
    home_page.open()
    home_page.wait_until_loaded()

    expect(home_page.page.locator(HomePageLocators.HEADER_TITLE)).to_be_visible()
    expect(home_page.page.locator(HomePageLocators.ADD_NEW_CAR_LINK)).to_be_visible()
    home_page.assert_no_horizontal_overflow()


def test_ts041_verify_homepage_layout_on_mobile_screen(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    mobile_home_page = HomePage(page, "http://localhost:3000")

    mobile_home_page.open()
    mobile_home_page.wait_until_loaded()
    expect(page.locator(HomePageLocators.ADD_NEW_CAR_LINK)).to_be_visible()
    mobile_home_page.assert_no_horizontal_overflow()
    context.close()


def test_ts042_verify_post_car_form_layout_on_mobile_screen(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    mobile_add_car_page = AddCarPage(page, "http://localhost:3000")

    mobile_add_car_page.open()
    expect(page.locator(AddCarPageLocators.TITLE_INPUT)).to_be_visible()
    expect(page.locator(AddCarPageLocators.CREATE_LISTING_BUTTON)).to_be_visible()
    overflow = page.evaluate("() => document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    assert overflow
    context.close()


def test_ts043_verify_labels_placeholders_and_field_names_are_user_friendly(add_car_page):
    add_car_page.open()

    page_text = add_car_page.page.locator("body").inner_text()
    assert "Car Title" in page_text
    assert "Brand" in page_text
    assert "Model" in page_text
    assert "Full Name" in page_text
    expect(add_car_page.page.locator(AddCarPageLocators.TITLE_INPUT)).to_have_attribute(
        "placeholder", "e.g., Honda Civic 2020"
    )
    expect(add_car_page.page.locator(AddCarPageLocators.SELLER_PHONE_INPUT)).to_have_attribute(
        "placeholder", "Your phone number"
    )


def test_ts044_verify_error_messages_are_clear_and_positioned_correctly(add_car_page):
    payload = build_car_payload()

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.fill_field(AddCarPageLocators.SELLER_NAME_INPUT, "")
    add_car_page.fill_field(AddCarPageLocators.SELLER_EMAIL_INPUT, "")
    add_car_page.fill_field(AddCarPageLocators.SELLER_PHONE_INPUT, "")
    add_car_page.set_form_no_validate()
    add_car_page.submit()

    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_be_visible()
    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_contain_text(
        "Please fill in all seller information"
    )


def test_ts045_verify_browser_refresh_behavior_on_homepage(home_page, car_factory):
    car = car_factory()

    home_page.open()
    home_page.wait_until_loaded()
    home_page.refresh()
    home_page.wait_until_loaded()

    expect(home_page.get_card_by_title(car["title"])).to_be_visible()


def test_ts046_verify_browser_refresh_behavior_on_car_details_page(car_details_page, car_factory):
    car = car_factory()

    car_details_page.open(car["_id"])
    car_details_page.wait_until_loaded()
    car_details_page.page.reload(wait_until="domcontentloaded")
    car_details_page.wait_until_loaded()

    expect(car_details_page.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(car["title"])


def test_ts047_verify_handling_when_backend_is_unavailable_on_homepage(home_page):
    home_page.page.route("**/api/cars*", lambda route: route.abort())

    home_page.open()
    home_page.wait_until_loaded()

    expect(home_page.page.locator(HomePageLocators.ERROR_BANNER)).to_be_visible()
    expect(home_page.page.locator(HomePageLocators.ERROR_BANNER)).to_contain_text(
        "Failed to fetch cars. Please try again later."
    )


def test_ts048_verify_handling_when_backend_is_unavailable_during_car_creation(add_car_page):
    payload = build_car_payload()
    add_car_page.page.route("**/api/cars", lambda route: route.abort())

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()

    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_be_visible()
    expect(add_car_page.page.locator(AddCarPageLocators.ERROR_BANNER)).to_contain_text(
        "Failed to create car listing"
    )


def test_ts049_verify_delete_failure_handling_when_backend_returns_an_error(home_page, car_details_page, car_factory):
    car = car_factory()
    messages = []
    handler = handle_all_dialogs(car_details_page.page, messages)

    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.page.route(
        f"**/api/cars/{car['_id']}",
        lambda route: route.fulfill(status=500, content_type="application/json", body='{"message":"Delete failed"}'),
    )
    car_details_page.click_delete_listing()
    car_details_page.page.wait_for_timeout(1000)
    remove_dialog_handler(car_details_page.page, handler)

    assert any("Failed to delete car listing." in message for message in messages)
    assert car_details_page.page.url.endswith(f"/car/{car['_id']}")


def test_ts050_verify_long_description_handling_in_ui(
    add_car_page, home_page, car_details_page, track_created_car_by_title
):
    payload = build_car_payload(description="Long description " * 40)
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    home_page.wait_until_loaded()
    home_page.open_car_details(payload["title"])
    car_details_page.wait_until_loaded()

    assert car_details_page.get_description_text().strip() == payload["description"].strip()


def test_ts051_verify_duplicate_car_listings_can_be_handled_consistently(home_page, car_factory):
    duplicate_title = "Duplicate QA Listing"
    first = car_factory(title=duplicate_title, brand="DuplicateBrand")
    second = car_factory(title=duplicate_title, brand="DuplicateBrand")

    home_page.open()
    home_page.wait_until_loaded()

    assert home_page.count_cars_with_title(duplicate_title) >= 2
    assert first["title"] == second["title"]


def test_ts052_verify_numeric_fields_handle_decimal_input_appropriately(add_car_page):
    add_car_page.open()
    add_car_page.fill_field(AddCarPageLocators.YEAR_INPUT, "2020.5")
    add_car_page.fill_field(AddCarPageLocators.PRICE_INPUT, "15000.5")
    add_car_page.fill_field(AddCarPageLocators.MILEAGE_INPUT, "45000.5")
    add_car_page.submit()

    assert add_car_page.is_input_invalid(AddCarPageLocators.YEAR_INPUT)
    assert add_car_page.is_input_invalid(AddCarPageLocators.PRICE_INPUT)
    assert add_car_page.is_input_invalid(AddCarPageLocators.MILEAGE_INPUT)


def test_ts053_verify_delete_action_visibility_only_for_eligible_listings(home_page, car_details_page, car_factory):
    unsold_car = car_factory()

    open_details_for_created_car(home_page, car_details_page, unsold_car)
    assert car_details_page.is_delete_button_visible()
    car_details_page.click_back()

    sold_car = car_factory()
    car_details_page.page.route(
        f"**/api/cars/{sold_car['_id']}",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=mock_car_response(sold_car, is_sold=True),
        ),
    )
    car_details_page.open(sold_car["_id"])
    car_details_page.wait_until_loaded()
    assert not car_details_page.is_delete_button_visible()


def test_ts054_verify_tab_order_and_keyboard_navigation_on_post_car_form(add_car_page):
    add_car_page.open()
    page = add_car_page.page

    page.keyboard.press("Tab")
    assert page.evaluate("() => document.activeElement.name") == "title"
    page.keyboard.press("Tab")
    assert page.evaluate("() => document.activeElement.name") == "brand"
    page.keyboard.press("Tab")
    assert page.evaluate("() => document.activeElement.name") == "model"


def test_ts055_verify_user_can_navigate_back_from_details_page_to_listings_page(home_page, car_details_page, car_factory):
    car = car_factory()

    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.click_back()

    expect(home_page.page.locator(HomePageLocators.AVAILABLE_CARS_TITLE)).to_be_visible()


def test_ts056_verify_ui_does_not_break_with_long_seller_name_or_contact_value(
    add_car_page, home_page, car_details_page, track_created_car_by_title
):
    payload = build_car_payload(
        seller={
            "name": "Very Long Seller Name " * 5,
            "email": "longseller@example.com",
            "phone": "1234567890" * 3,
        }
    )
    messages = []
    handler = handle_all_dialogs(add_car_page.page, messages)

    add_car_page.open()
    add_car_page.fill_car_form(payload)
    add_car_page.submit()
    add_car_page.page.wait_for_url("**/")
    remove_dialog_handler(add_car_page.page, handler)
    track_created_car_by_title(payload["title"])

    home_page.wait_until_loaded()
    home_page.open_car_details(payload["title"])
    car_details_page.wait_until_loaded()

    page_text = car_details_page.get_page_text()
    assert "Very Long Seller Name" in page_text
    assert "1234567890" in page_text


def test_ts057_verify_page_behavior_when_user_opens_multiple_car_details_in_sequence(home_page, car_details_page, car_factory):
    first = car_factory()
    second = car_factory()
    third = car_factory()

    for car in (first, second, third):
        home_page.open()
        home_page.wait_until_loaded()
        home_page.open_car_details(car["title"])
        car_details_page.wait_until_loaded()
        expect(car_details_page.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(car["title"])


def test_ts059_verify_data_persistence_after_successful_creation_and_page_reload(home_page, car_details_page, car_factory):
    car = car_factory()

    home_page.open()
    home_page.wait_until_loaded()
    expect(home_page.get_card_by_title(car["title"])).to_be_visible()

    home_page.refresh()
    home_page.wait_until_loaded()
    expect(home_page.get_card_by_title(car["title"])).to_be_visible()

    home_page.open_car_details(car["title"])
    car_details_page.wait_until_loaded()
    car_details_page.page.reload(wait_until="domcontentloaded")
    car_details_page.wait_until_loaded()
    expect(car_details_page.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(car["title"])


def test_ts060_verify_deleted_listing_does_not_reappear_after_page_reload(home_page, car_details_page, car_factory):
    car = car_factory()
    messages = []
    handler = handle_all_dialogs(car_details_page.page, messages)

    open_details_for_created_car(home_page, car_details_page, car)
    car_details_page.click_delete_listing()
    car_details_page.page.wait_for_url("**/")
    remove_dialog_handler(car_details_page.page, handler)

    home_page.refresh()
    home_page.wait_until_loaded()
    assert not home_page.car_exists(car["title"])

    car_details_page.open(car["_id"])
    car_details_page.wait_until_loaded()
    expect(car_details_page.page.locator(CarDetailsPageLocators.ERROR_BANNER)).to_be_visible()
