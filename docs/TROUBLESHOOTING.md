# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### Installation & Setup Issues

#### Issue: "Cannot find command npm"
**Symptoms**: `npm: command not found` or `'npm' is not recognized`
**Cause**: Node.js not installed or not in PATH
**Solution**:
1. Download Node.js from https://nodejs.org/
2. Run installer and follow prompts
3. Restart terminal/Command Prompt
4. Verify: `node --version` and `npm --version`

---

#### Issue: "npm install hangs or times out"
**Symptoms**: Installation takes forever or stops responding
**Cause**: Network issue or npm registry timeout
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still fails, use yarn instead
npm install -g yarn
yarn install
```

---

#### Issue: "Module not found: Can't resolve"
**Symptoms**: 
```
Module not found: Can't resolve 'react'
Cannot find module 'express'
```
**Cause**: Dependencies not installed
**Solution**:
```bash
# In the folder showing error
npm install

# Or reinstall everything
rm -rf node_modules package-lock.json
npm install
```

---

### MongoDB Connection Issues

#### Issue: "MongooseError: Cannot connect to MongoDB"
**Symptoms**: 
```
Error: connect ECONNREFUSED 127.0.0.1:27017
MongoDB connection failed
```
**Cause**: MongoDB not running or connection string wrong
**Solution 1: Start MongoDB locally**
- **Windows**: MongoDB should start automatically as service
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`
- **Verify**: `mongo` (should connect)

**Solution 2: Use MongoDB Atlas (cloud)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update .env:
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
6. Restart backend
```

---

#### Issue: "Authentication failed for database"
**Symptoms**: 
```
MongoServerError: connect EAUTH authentication failed
```
**Cause**: Wrong username/password in connection string
**Solution**:
```
1. Check your MongoDB Atlas credentials
2. Copy connection string correctly
3. Update .env with correct string:
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/car-selling-db
4. Use URL encoding for special characters (@, #, %, etc)
   Example: @ = %40, # = %23, % = %25
5. Restart backend
```

---

#### Issue: "ECONNREFUSED when trying to connect"
**Symptoms**: Cannot connect to MongoDB on localhost:27017
**Cause**: Wrong connection string or MongoDB not running
**Solution**:
```
1. Verify MongoDB is running
   Windows: Check Services (MongoDB)
   Mac: brew services list
   Linux: systemctl status mongod

2. Check .env file:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/car-selling-db
   NODE_ENV=development

3. Verify no special characters in password
4. If using Atlas, don't use localhost
```

---

### Backend Issues

#### Issue: "Error: listen EADDRINUSE :::5000"
**Symptoms**: 
```
Error: listen EADDRINUSE :::5000
Port 5000 already in use
```
**Cause**: Another process using port 5000
**Solution 1**: Kill the process
```powershell
# PowerShell
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Or use npm
npm install -g kill-port
kill-port 5000
```

**Solution 2**: Use different port
```
1. Edit backend/.env
2. Change PORT=5001
3. Restart backend
4. Update frontend/.env: REACT_APP_API_URL=http://localhost:5001/api
5. Restart frontend
```

---

#### Issue: "Cannot GET /api/health"
**Symptoms**: 
```
GET http://localhost:5000/api/health
Status: 404
Cannot GET /api/health
```
**Cause**: Backend not running or wrong URL
**Solution**:
```
1. Verify backend is running
   Check terminal: "Server running on port 5000"
2. Verify MongoDB is connected
   Check terminal: "MongoDB connected successfully"
3. Check URL is correct (http not https)
4. Try in browser, not frontend code first
```

---

#### Issue: "UnhandledPromiseRejectionWarning"
**Symptoms**: Unhandled promise rejection warning in terminal
**Cause**: .catch() or try-catch missing on async operation
**Solution**: Add error handling
```javascript
// Bad
Car.find()

// Good
try {
  const cars = await Car.find()
} catch (error) {
  res.status(500).json({ error: error.message })
}
```

---

### Frontend Issues

#### Issue: "Blank white screen, nothing loads"
**Symptoms**: 
```
http://localhost:3000 shows blank page
No console errors
```
**Cause**: React not mounting or HTML missing
**Solution**:
```
1. Check public/index.html exists
2. Check it has <div id="root"></div>
3. Check src/index.js exists and correct
4. Check frontend/.env exists
5. Try hard refresh (Ctrl+Shift+R)
6. Clear browser cache
7. Restart frontend: npm start
```

---

#### Issue: "GET http://localhost:5000/api/cars 404"
**Symptoms**: 
```
Cannot GET /api/cars 404 Not Found
or
CORS error in console
```
**Cause**: Backend not running or endpoint wrong
**Solution**:
```
1. Verify backend is running on port 5000
2. Check frontend/.env has correct URL:
   REACT_APP_API_URL=http://localhost:5000/api
3. Check backend server.js has CORS:
   app.use(cors())
4. Verify route exists in carRoutes.js
5. Try directly in browser: http://localhost:5000/api/cars
```

---

#### Issue: "Blank data on page or 'Cannot read property _id'"
**Symptoms**: 
```
TypeError: Cannot read property 'map' of undefined
Cannot read property '_id' of undefined
Blank listings page
```
**Cause**: API return wrong format or component not waiting for data
**Solution**:
```javascript
// Check API response format in services/api.js
// Response should be:
{
  success: true,
  data: [...]  // Array of cars
}

// In component, use conditional rendering:
{cars.map(car => <CarCard key={car._id} car={car} />)}

// Better:
{!loading && cars && cars.length > 0 && 
  cars.map(car => <CarCard key={car._id} car={car} />)
}
```

---

#### Issue: "Form doesn't submit or page doesn't redirect"
**Symptoms**: 
```
Click submit button, nothing happens
No error in console
Page doesn't redirect to homepage
```
**Cause**: Validation failure or API error not caught
**Solution**:
```javascript
// Add debugging:
const handleSubmit = async (e) => {
  e.preventDefault()
  console.log("Form data:", formData)  // Add this
  
  try {
    const response = await carAPI.createCar(formData)
    console.log("Response:", response)  // Add this
    alert('Success!')
    navigate('/')
  } catch (error) {
    console.error("Error:", error)  // Add this
    alert(error.response?.data?.message || error.message)
  }
}
```

---

#### Issue: "Images not loading on page"
**Symptoms**: 
```
Image containers show alt text or are blank
No image displayed in CarCard or detail page
```
**Cause**: Image URL invalid or endpoint unreachable
**Solution**:
```
1. Verify image URL is valid HTTPS
2. Try URL in new browser tab
3. Check CORS on image server
4. Use placeholder: https://via.placeholder.com/400x300
5. In CarCard, ensure fallback shows:
   {car.images && car.images.length > 0 ? 
     <img src={car.images[0]} /> :
     <p>No Image</p>
   }
```

---

### CORS Issues

#### Issue: "Access to XMLHttpRequest blocked by CORS policy"
**Symptoms**: 
```
CORS error in browser console
Request blocked by browser
```
**Cause**: Backend doesn't have CORS enabled
**Solution**: Ensure backend server.js has:
```javascript
const cors = require('cors')
const app = express()
app.use(cors())  // Add this before routes
```

Then restart backend.

---

### Data Issues

#### Issue: "Cars don't appear after adding new listing"
**Symptoms**: 
```
Form submits successfully
alert shows success
Redirects to home
But new car not in list
```
**Cause**: Data not saved or fetch not showing new data
**Solution**:
```
1. Check MongoDB Compass for data
2. Verify fields match schema exactly
3. Ensure isSold not hardcoded
4. Check backend logs for save errors
5. Try refreshing page (F5)
6. Try clearing browser cache
```

---

#### Issue: "Filters don't work or show no results"
**Symptoms**: 
```
Select filter and apply
Page shows "No cars found"
```
**Cause**: Filter query wrong or no matching data
**Solution**:
```javascript
// Check carController.js getAllCars function
// Ensure filters are applied correctly
// In HomePage, verify filter values:
console.log("Filters:", filters)  // Add this
const response = await carAPI.getFilteredCars(filters)
console.log("Response:", response)  // Add this
```

---

### Performance Issues

#### Issue: "Page loads slowly"
**Symptoms**: 
```
Taking 5+ seconds to load page
Freezing when adding/deleting
Slow responsiveness
```
**Cause**: Too much data or inefficient queries
**Solution**:
```
1. Add pagination (limit 10 cars per page)
2. Use MongoDB indexes on frequently queried fields
3. Avoid loading all images at once (lazy load)
4. Check for console warnings or errors
5. Use React DevTools to find slow renders
```

---

### Authentication & Security

#### Issue: "Cannot access secure endpoints without token"
**This is expected behavior** - production feature
**When adding auth later**:
```
Frontend must:
1. Store JWT in localStorage
2. Add to each request header: Authorization: Bearer <token>

Backend must:
1. Create login endpoint
2. Verify token on protected routes
3. Return 401 if no/invalid token
```

---

## 🐛 Debugging Techniques

### 1. Browser DevTools (F12)

**Console Tab**:
```javascript
// Check for errors
// See all console.logs you add
// Test code: 
console.log('Test')

// Check API response format:
fetch('http://localhost:5000/api/cars')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Network Tab**:
```
1. Open DevTools (F12)
2. Click Network tab
3. Perform action (click button)
4. See all requests
5. Click request to see:
   - Headers (what was sent)
   - Response (what server returned)
   - Status (200 = success, 404 = not found, 500 = error)
```

**Application Tab**:
```
1. See localStorage/sessionStorage
2. Verify .env variables are set
3. Check cookies if using auth
```

---

### 2. Terminal/Command Prompt Debugging

```bash
# Backend terminal:
# Look for:
# ✓ "Server running on port 5000"
# ✓ "MongoDB connected successfully"
# ✗ "Cannot find module" - install dependencies
# ✗ "Cannot connect to MongoDB" - start MongoDB

# Frontend terminal:
# Look for:
# ✓ "Compiled successfully"
# ✗ "Failed to compile" - check the error
# ✗ "Cannot find module" - run npm install
```

---

### 3. MongoDB Compass

```
1. Download from https://www.mongodb.com/products/tools/compass
2. Connect to your MongoDB
3. View databases and collections
4. See documents created
5. Verify schema matches expectations
```

---

### 4. Postman for API Testing

```
1. Download Postman from https://www.postman.com
2. Create request: GET http://localhost:5000/api/cars
3. Send and see response
4. For POST, add body:
   Type: JSON
   Body: {"title": "Test", ...}
5. Verify endpoint works before debugging frontend
```

---

### 5. Add Console Logs

**Backend**:
```javascript
console.log('Received request:', req.body)
console.log('Query filters:', req.query)
console.log('Car saved:', car)
```

**Frontend**:
```javascript
console.log('Form data:', formData)
console.log('API response:', response)
console.log('State updated:', cars)
```

---

## 📋 Pre-Launch Checklist

Before saying "it works", verify:

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend loads at localhost:3000
- [ ] Home page shows car grid
- [ ] Can add a new car
- [ ] New car appears in grid
- [ ] Can click car to see details
- [ ] Can filter cars by brand
- [ ] Can filter by price
- [ ] Can mark car as sold
- [ ] Can delete unsold car
- [ ] Cannot delete sold car
- [ ] All images load or show placeholder
- [ ] No console errors (F12)
- [ ] No terminal errors

---

## ⚡ Quick Fixes

### "It's not working" Quick Checklist

```
1. Both backend and frontend running?
   ✓ Terminal 1: cd backend && npm start
   ✓ Terminal 2: cd frontend && npm start

2. MongoDB running?
   ✓ mongod (local) or
   ✓ MongoDB Atlas connection working

3. Port conflicts?
   ✓ 5000 for backend, 3000 for frontend
   ✓ Check terminal for errors

4. .env files exist?
   ✓ backend/.env (copy from .env.example)
   ✓ frontend/.env (copy from .env.example)

5. All dependencies installed?
   ✓ npm install in both folders

6. Try hard refresh?
   ✓ Ctrl+Shift+R (frontend)
   ✓ Close and reopen (browser)

7. Check console/terminal?
   ✓ F12 (browser console)
   ✓ Terminal output (backend)

If still broken:
- Kill processes: npm run kill (or manually)
- Delete node_modules: rm -rf node_modules
- Reinstall: npm install
- Restart: npm start
```

---

## 📞 Still Stuck?

### Information to Gather

When seeking help, provide:

1. **Error message** (exact text)
2. **Where it happens** (which page/action)
3. **What you did** (steps to reproduce)
4. **Terminal output** (full error log)
5. **Console errors** (browser DevTools)
6. **Your environment** (Windows/Mac, Node version)

### Where to Get Help

1. **Documentation**: Read ALL markdown files first
2. **Console**: Check browser (F12) and terminal for errors
3. **Code comments**: Look for explanations in code
4. **Google**: Search the exact error message
5. **Stack Overflow**: Similar issues with solutions

---

