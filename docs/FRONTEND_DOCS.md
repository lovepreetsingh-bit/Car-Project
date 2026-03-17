# Frontend Documentation

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx       # Homepage with all cars
│   │   ├── CarDetailPage.jsx  # Car details view
│   │   └── AddCarPage.jsx     # Create new listing form
│   ├── components/
│   │   └── CarCard.jsx        # Reusable car card
│   ├── services/
│   │   └── api.js             # API service
│   ├── App.js                 # Main app component
│   ├── index.js               # React entry point
│   └── index.css              # Tailwind styles
└── package.json
```

---

## Component Breakdown

### 1. HomePage (`pages/HomePage.jsx`)

**Purpose**: Display all car listings with filtering capabilities

**Features**:
- Fetches all unsold cars on mount
- Filter by brand, price range
- Responsive grid layout
- Loading and error states

**Key Functions**:
```javascript
fetchCars()           // Fetch cars from API
applyFilters()        // Apply filter values
handleFilterChange()  // Update filter state
```

**Props**: None (uses React Router)

**State**:
- `cars`: Array of car objects
- `loading`: Boolean for loading state
- `error`: Error message if any
- `filters`: Object with filter values

---

### 2. CarDetailPage (`pages/CarDetailPage.jsx`)

**Purpose**: Show detailed information about a single car

**Features**:
- Get car ID from URL params
- Display full car details
- Image gallery with navigation
- Seller contact information
- Delete and mark as sold options

**Key Functions**:
```javascript
handleDelete()        // Delete car listing
handleMarkAsSold()    // Mark car as sold
```

**Special Features**:
- Image gallery with dots for navigation
- Auto-linked email and phone
- Date formatting for listing creation
- Back button to homepage

---

### 3. AddCarPage (`pages/AddCarPage.jsx`)

**Purpose**: Form to create new car listings

**Features**:
- Comprehensive form with validation
- Image URL management (up to 5 images)
- Seller information fields
- Real-time character count for description
- Success/error feedback

**Form Sections**:
1. Car Information
   - Title, Brand, Model, Year
   - Price, Mileage
   - Description (max 1000 chars)

2. Images
   - Add multiple image URLs
   - Preview with thumbnail
   - Remove option

3. Seller Information
   - Name, Email, Phone
   - City (optional)

---

### 4. CarCard (`components/CarCard.jsx`)

**Purpose**: Reusable component to display car summary

**Props**:
```javascript
{
  car: {
    _id: String,
    title: String,
    year: Number,
    brand: String,
    model: String,
    price: Number,
    mileage: Number,
    images: Array,
    seller: {
      name: String,
      phone: String
    }
  }
}
```

**Features**:
- Displays first image or placeholder
- Shows price and mileage
- Basic seller information
- Link to detail page

---

## API Service (`services/api.js`)

Centralized API calls using Axios

```javascript
// API instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

// Methods
carAPI.getAllCars()              // GET /cars
carAPI.getCarById(id)            // GET /cars/:id
carAPI.createCar(data)           // POST /cars
carAPI.updateCar(id, data)       // PUT /cars/:id
carAPI.deleteCar(id)             // DELETE /cars/:id
carAPI.markCarAsSold(id)         // PATCH /cars/:id/sold
carAPI.getFilteredCars(filters)  // GET /cars with query params
```

---

## Routing

**App.js** defines all routes:

```javascript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/car/:id" element={<CarDetailPage />} />
  <Route path="/add-car" element={<AddCarPage />} />
</Routes>
```

---

## Styling with Tailwind CSS

All components use Tailwind utility classes:

**Color Scheme**:
- Primary: Blue (`bg-blue-600`)
- Success: Green (`bg-green-600`)
- Warning: Yellow (`bg-yellow-600`)
- Danger: Red (`bg-red-600`)
- Neutral: Gray (`bg-gray-*`)

**Responsive Classes**:
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)

**Common Patterns**:
```
Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Card: bg-white rounded-lg shadow p-4
Button: px-4 py-2 rounded hover:opacity-90 transition
Input: border rounded px-4 py-2 focus:ring-2
```

---

## Form Validation

### AddCarPage Validation

**Required Fields**:
- title, brand, model, price, mileage, description
- seller.name, seller.email, seller.phone

**Field Constraints**:
- year: 1900 to current year + 1
- price, mileage: >= 0
- description: max 1000 characters
- images: max 5

**Validation Logic**:
```javascript
if (!formData.title || !formData.brand || ...) {
  setError('Please fill in all required fields');
  return;
}
```

---

## State Management Pattern

Each page manages its own state using `useState`:

```javascript
const [cars, setCars] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
```

**No Redux or Context API needed** for this learning project.

---

## API Error Handling

All API calls wrapped in try-catch:

```javascript
try {
  const response = await carAPI.getAllCars()
  setCars(response.data.data)
} catch (err) {
  setError('Failed to fetch cars')
  console.error(err)
}
```

---

## Environment Variables

Create `.env` file in frontend folder:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Access in code:
```javascript
process.env.REACT_APP_API_URL
```

---

## Performance Tips

1. **Image Optimization**
   - Use placeholder images in development
   - In production, use optimized image hosting
   - Lazy load images

2. **API Calls**
   - Fetch only needed data
   - Implement pagination for large datasets
   - Cache responses where appropriate

3. **Rendering**
   - Use keys in lists
   - Memoize components if needed
   - Avoid inline function definitions

---

## Common Issues & Solutions

### Issue: Images Not Loading
- Check image URLs are valid HTTPS
- Verify CORS is enabled on image server
- Use `onerror` fallback

### Issue: Form Not Submitting
- Verify all required fields are filled
- Check browser console for errors
- Ensure backend is running

### Issue: Infinite Loading
- Check for console errors
- Verify API endpoint is correct
- Check network tab in DevTools

---

## Future Frontend Enhancements

1. **Authentication**
   - Login/Register forms
   - Protected routes with PrivateRoute component
   - Store JWT in localStorage

2. **User Dashboard**
   - Show user's listings
   - Profile page
   - Edit/delete own listings only

3. **Advanced Features**
   - Favorites/Wishlist
   - Search with debounce
   - Sort options
   - Map integration for location

4. **UX Improvements**
   - Toast notifications
   - Infinite scroll pagination
   - Dark mode theme
   - Animations with Framer Motion

---

