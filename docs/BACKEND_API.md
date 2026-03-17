# Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "count": 0
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Endpoints Detailed

### 1. Get All Cars
**GET /cars**

**Query Parameters:**
- `brand` (optional): Filter by car brand
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `year` (optional): Filter by year

**Example:**
```
GET /cars?brand=Honda&minPrice=10000&maxPrice=20000
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "63f7a1b2c3d4e5f6g7h8i9j0",
      "title": "Honda Civic 2020",
      "brand": "Honda",
      "model": "Civic",
      "year": 2020,
      "price": 15000,
      "mileage": 50000,
      "description": "Well maintained",
      "images": ["url1", "url2"],
      "seller": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-1234",
        "city": "New York"
      },
      "isSold": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Single Car
**GET /cars/:id**

**Parameters:**
- `id` (required): MongoDB ID of the car

**Response:**
```json
{
  "success": true,
  "data": { /* Car object */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Car not found"
}
```

---

### 3. Create Car Listing
**POST /cars**

**Request Body:**
```json
{
  "title": "Honda Civic 2020",
  "brand": "Honda",
  "model": "Civic",
  "year": 2020,
  "price": 15000,
  "mileage": 50000,
  "description": "Well maintained, single owner",
  "images": ["https://example.com/car.jpg"],
  "seller": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234",
    "city": "New York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Car listing created successfully",
  "data": { /* Created car object */ }
}
```

**Validation:**
- All fields except `images` and `seller.city` are required
- `year`: Must be between 1900 and current year + 1
- `price` & `mileage`: Must be >= 0
- `description`: Max 1000 characters

---

### 4. Update Car Listing
**PUT /cars/:id**

**Parameters:**
- `id` (required): MongoDB ID of the car

**Request Body:**
```json
{
  "price": 14000,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Car listing updated successfully",
  "data": { /* Updated car object */ }
}
```

**Notes:**
- Cannot update a car marked as sold
- Can update any field

---

### 5. Delete Car Listing
**DELETE /cars/:id**

**Parameters:**
- `id` (required): MongoDB ID of the car

**Response:**
```json
{
  "success": true,
  "message": "Car listing deleted successfully"
}
```

**Notes:**
- Cannot delete a car marked as sold

---

### 6. Mark Car as Sold
**PATCH /cars/:id/sold**

**Parameters:**
- `id` (required): MongoDB ID of the car

**Response:**
```json
{
  "success": true,
  "message": "Car marked as sold",
  "data": { /* Updated car object with isSold: true */ }
}
```

---

## Error Codes

| Status | Error | Explanation |
|--------|-------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Testing with Postman

### Import Collection
Create a new collection with these requests:

**1. Get All Cars**
```
GET http://localhost:5000/api/cars
```

**2. Create Car**
```
POST http://localhost:5000/api/cars
Content-Type: application/json

{
  "title": "BMW 3 Series 2021",
  "brand": "BMW",
  "model": "3 Series",
  "year": 2021,
  "price": 32000,
  "mileage": 30000,
  "description": "Luxury sedan in perfect condition",
  "images": ["https://via.placeholder.com/400x300"],
  "seller": {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-9999",
    "city": "San Francisco"
  }
}
```

**3. Get Single Car** (replace ID)
```
GET http://localhost:5000/api/cars/63f7a1b2c3d4e5f6g7h8i9j0
```

**4. Update Car** (replace ID)
```
PUT http://localhost:5000/api/cars/63f7a1b2c3d4e5f6g7h8i9j0
Content-Type: application/json

{
  "price": 30000,
  "description": "Price reduced for quick sale"
}
```

**5. Mark as Sold** (replace ID)
```
PATCH http://localhost:5000/api/cars/63f7a1b2c3d4e5f6g7h8i9j0/sold
```

**6. Delete Car** (replace ID)
```
DELETE http://localhost:5000/api/cars/63f7a1b2c3d4e5f6g7h8i9j0
```

---

## Code Structure Explanation

### Model (Car.js)
- Defines the structure of car documents
- Includes validation (required fields, type checking)
- Auto-generated timestamps

### Controller (carController.js)
- Contains business logic for each operation
- Validates input data
- Interacts with the database
- Returns appropriate responses

### Routes (carRoutes.js)
- Maps HTTP methods to controller functions
- Defines API endpoints
- Handles request routing

### Server (server.js)
- Sets up Express app
- Configures middleware (CORS, JSON parsing)
- Connects to MongoDB
- Defines routes
- Starts the server

---

