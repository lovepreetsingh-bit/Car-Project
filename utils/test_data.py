from copy import deepcopy
from uuid import uuid4


def build_car_payload(**overrides):
    suffix = uuid4().hex[:8]
    payload = {
        "title": f"QA Car {suffix}",
        "brand": f"QABrand{suffix}",
        "model": f"QAModel{suffix}",
        "year": 2022,
        "price": 18500,
        "mileage": 42000,
        "description": f"QA automation test listing {suffix}",
        "images": [],
        "seller": {
            "name": f"Seller {suffix}",
            "email": f"seller_{suffix}@example.com",
            "phone": f"99999{suffix[:5]}",
            "city": "Pune",
        },
    }

    merged = deepcopy(payload)
    for key, value in overrides.items():
        if key == "seller":
            merged["seller"].update(value)
        else:
            merged[key] = value
    return merged
