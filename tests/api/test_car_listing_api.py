def test_ts058_verify_server_side_validation_for_missing_required_fields_through_direct_request_behavior(
    api_request_context,
):
    response = api_request_context.post(
        "cars",
        data={"title": "Invalid car", "brand": "Invalid", "seller": {"name": "No Fields"}},
    )

    assert response.status == 400
    assert "Please provide all required fields" in response.text()
