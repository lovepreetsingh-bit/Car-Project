from playwright.sync_api import expect

from locators.car_locators import CarDetailsPageLocators


class CarDetailsPage:
    def __init__(self, page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self, car_id: str) -> None:
        self.page.goto(f"{self.base_url}/car/{car_id}", wait_until="domcontentloaded")

    def wait_until_loaded(self) -> None:
        loading = self.page.locator(CarDetailsPageLocators.LOADING_TEXT)
        if loading.count():
            loading.wait_for(state="hidden", timeout=15000)

    def get_title_text(self) -> str:
        return self.page.locator(CarDetailsPageLocators.TITLE).inner_text()

    def get_description_text(self) -> str:
        return self.page.locator(CarDetailsPageLocators.DESCRIPTION_TEXT).inner_text()

    def get_page_text(self) -> str:
        return self.page.locator("body").inner_text()

    def click_back(self) -> None:
        self.page.locator(CarDetailsPageLocators.BACK_TO_LISTINGS_BUTTON).click()

    def click_delete_listing(self) -> None:
        self.page.locator(CarDetailsPageLocators.DELETE_LISTING_BUTTON).click()

    def is_delete_button_visible(self) -> bool:
        locator = self.page.locator(CarDetailsPageLocators.DELETE_LISTING_BUTTON)
        return locator.count() > 0 and locator.is_visible()

    def assert_title(self, title: str) -> None:
        expect(self.page.locator(CarDetailsPageLocators.TITLE)).to_have_text(title)
