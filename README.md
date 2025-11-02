# Barista Cafe - Booking System

A complete cafe booking system with MySQL backend integration for the Barista Cafe website.

## Features

- **Frontend**: Beautiful responsive website with booking form
- **Backend**: Node.js/Express API with MySQL database
- **Admin Panel**: Complete booking management system
- **Real-time**: Available time slot checking
- **Validation**: Form validation and error handling

## Project Structure

```
├── 2137_barista_cafe/          # Frontend website files
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
│   ├── images/                 # Images and assets
│   ├── index.html              # Main website
│   └── reservation.html        # Booking form (updated)
├── admin.html                  # Admin panel
├── server.js                   # Backend API server
├── package.json                # Node.js dependencies
├── env.example                 # Environment variables template
└── scripts/
    └── init-database.js        # Database initialization script
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE barista_cafe;
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Update `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=barista_cafe
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

4. Initialize the database:
```bash
npm run init-db
```

### 3. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 4. Serve the Frontend

You can serve the frontend using any static file server. Here are a few options:

**Option 1: Using Python (if installed)**
```bash
cd 2137_barista_cafe
python -m http.server 8080
```

**Option 2: Using Node.js http-server**
```bash
npm install -g http-server
cd 2137_barista_cafe
http-server -p 8080
```

**Option 3: Using Live Server (VS Code extension)**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

The website will be available at `http://localhost:8080`

### 5. Access Admin Panel

Open `admin.html` in your browser to access the booking management system.

## API Endpoints

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Menu
- `GET /api/menu` - Get menu items

### Utilities
- `GET /api/health` - Health check
- `GET /api/available-slots/:date` - Get available time slots for a date

## Database Schema

### Bookings Table
- `id` - Primary key
- `customer_name` - Customer's full name
- `phone` - Contact phone number
- `booking_date` - Date of booking
- `booking_time` - Time of booking
- `number_of_people` - Number of guests
- `special_requests` - Additional notes
- `status` - Booking status (pending, confirmed, cancelled, completed)
- `created_at` - Timestamp when booking was created
- `updated_at` - Timestamp when booking was last updated

### Menu Items Table
- `id` - Primary key
- `name` - Item name
- `description` - Item description
- `price` - Item price
- `category` - Item category (breakfast, coffee, dessert, beverage)
- `is_available` - Availability status
- `is_recommended` - Recommendation flag

## Usage

### Making a Booking

1. Visit the reservation page (`reservation.html`)
2. Fill out the booking form with:
   - Full name
   - Phone number
   - Preferred date and time
   - Number of people
   - Special requests (optional)
3. Submit the form
4. Receive confirmation message

### Managing Bookings (Admin)

1. Open `admin.html` in your browser
2. View all bookings with filtering options
3. Update booking status (pending → confirmed → completed)
4. Search bookings by name or phone
5. Filter by date or status

## Configuration

### Time Slots
The system generates time slots from 9:00 AM to 9:00 PM, every 30 minutes. Maximum 5 bookings per time slot.

### Booking Status Flow
- `pending` - New booking awaiting confirmation
- `confirmed` - Booking confirmed by staff
- `cancelled` - Booking cancelled
- `completed` - Booking fulfilled

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **CORS Errors**
   - Make sure frontend URL in `.env` matches your frontend server
   - Check that both servers are running

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes using the port

### Logs
Check the console output of the Node.js server for detailed error messages.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Use SSL certificates
5. Configure proper MySQL user permissions
6. Set up database backups

## License

This project is based on the Tooplate Barista Cafe template and extends it with backend functionality.
