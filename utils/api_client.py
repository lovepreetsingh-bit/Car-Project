from typing import Any


class CarApiClient:
    def __init__(self, request_context):
        self.request_context = request_context

    def create_car(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = self.request_context.post("cars", data=payload)
        assert response.ok, f"Failed to create car. Status: {response.status}, Body: {response.text()}"
        return response.json()["data"]

    def list_cars(self, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        response = self.request_context.get("cars", params=params or {})
        assert response.ok, f"Failed to list cars. Status: {response.status}, Body: {response.text()}"
        return response.json()["data"]

    def get_car(self, car_id: str) -> dict[str, Any]:
        response = self.request_context.get(f"cars/{car_id}")
        assert response.ok, f"Failed to get car. Status: {response.status}, Body: {response.text()}"
        return response.json()["data"]

    def delete_car(self, car_id: str, expect_ok: bool = True):
        response = self.request_context.delete(f"cars/{car_id}")
        if expect_ok:
            assert response.ok, f"Failed to delete car. Status: {response.status}, Body: {response.text()}"
        return response
