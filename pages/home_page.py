from playwright.sync_api import expect

from locators.car_locators import HomePageLocators


class HomePage:
    def __init__(self, page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self) -> None:
        self.page.goto(f"{self.base_url}/", wait_until="domcontentloaded")
        expect(self.page.locator(HomePageLocators.HEADER_TITLE)).to_be_visible()

    def wait_until_loaded(self) -> None:
        loading = self.page.locator(HomePageLocators.LOADING_TEXT)
        if loading.count():
            loading.wait_for(state="hidden", timeout=15000)

    def click_add_new_car(self) -> None:
        self.page.locator(HomePageLocators.ADD_NEW_CAR_LINK).click()

    def apply_filters(self, brand: str = "", min_price: str = "", max_price: str = "") -> None:
        self.page.locator(HomePageLocators.FILTER_BRAND_INPUT).fill(brand)
        self.page.locator(HomePageLocators.FILTER_MIN_PRICE_INPUT).fill(min_price)
        self.page.locator(HomePageLocators.FILTER_MAX_PRICE_INPUT).fill(max_price)
        self.page.locator(HomePageLocators.APPLY_FILTERS_BUTTON).click()

    def get_card_by_title(self, title: str):
        return self.page.locator(HomePageLocators.CAR_CARD).filter(has_text=title).first

    def get_cards_by_title(self, title: str):
        return self.page.locator(HomePageLocators.CAR_CARD).filter(has_text=title)

    def open_car_details(self, title: str) -> None:
        card = self.get_card_by_title(title)
        expect(card).to_be_visible()
        card.locator(HomePageLocators.VIEW_DETAILS_LINK).click()

    def car_exists(self, title: str) -> bool:
        return self.get_cards_by_title(title).count() > 0

    def count_cars_with_title(self, title: str) -> int:
        return self.get_cards_by_title(title).count()

    def refresh(self) -> None:
        self.page.reload(wait_until="domcontentloaded")

    def assert_no_horizontal_overflow(self) -> None:
        overflow = self.page.evaluate(
            "() => document.documentElement.scrollWidth <= document.documentElement.clientWidth"
        )
        assert overflow, "Expected page layout without horizontal overflow"
