from typing import Any

from playwright.sync_api import expect

from locators.car_locators import AddCarPageLocators


class AddCarPage:
    def __init__(self, page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self) -> None:
        self.page.goto(f"{self.base_url}/add-car", wait_until="domcontentloaded")
        expect(self.page.locator(AddCarPageLocators.PAGE_TITLE)).to_be_visible()

    def fill_car_form(self, car_data: dict[str, Any]) -> None:
        self.page.locator(AddCarPageLocators.TITLE_INPUT).fill(car_data["title"])
        self.page.locator(AddCarPageLocators.BRAND_INPUT).fill(car_data["brand"])
        self.page.locator(AddCarPageLocators.MODEL_INPUT).fill(car_data["model"])
        self.page.locator(AddCarPageLocators.YEAR_INPUT).fill(str(car_data["year"]))
        self.page.locator(AddCarPageLocators.PRICE_INPUT).fill(str(car_data["price"]))
        self.page.locator(AddCarPageLocators.MILEAGE_INPUT).fill(str(car_data["mileage"]))
        self.page.locator(AddCarPageLocators.DESCRIPTION_TEXTAREA).fill(car_data["description"])

        for image_url in car_data.get("images", []):
            self.add_image_url(image_url)

        seller = car_data["seller"]
        self.page.locator(AddCarPageLocators.SELLER_NAME_INPUT).fill(seller["name"])
        self.page.locator(AddCarPageLocators.SELLER_EMAIL_INPUT).fill(seller["email"])
        self.page.locator(AddCarPageLocators.SELLER_PHONE_INPUT).fill(seller["phone"])
        self.page.locator(AddCarPageLocators.SELLER_CITY_INPUT).fill(seller.get("city", ""))

    def add_image_url(self, image_url: str) -> None:
        image_input = self.page.locator(AddCarPageLocators.IMAGE_URL_INPUT)
        image_input.fill(image_url)
        image_input.press("Enter")

    def submit(self) -> None:
        self.page.locator(AddCarPageLocators.CREATE_LISTING_BUTTON).click()

    def set_form_no_validate(self) -> None:
        self.page.locator(AddCarPageLocators.FORM).evaluate("(form) => { form.noValidate = true; }")

    def fill_field(self, selector: str, value: str) -> None:
        self.page.locator(selector).fill(value)

    def set_field_via_js(self, selector: str, value: str) -> None:
        self.page.locator(selector).evaluate(
            """(input, nextValue) => {
                input.value = nextValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }""",
            value,
        )

    def get_input_value(self, selector: str) -> str:
        return self.page.locator(selector).input_value()

    def get_validation_message(self, selector: str) -> str:
        return self.page.locator(selector).evaluate("(input) => input.validationMessage")

    def is_input_invalid(self, selector: str) -> bool:
        return self.page.locator(selector).evaluate("(input) => !input.checkValidity()")
