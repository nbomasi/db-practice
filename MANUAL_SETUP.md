# Manual Setup Guide - Barista Cafe Booking System

This guide will walk you through manually setting up the Barista Cafe booking system step by step, using a `.env` file for configuration.

## Prerequisites

- ✅ MySQL database installed and running
- ✅ Node.js (v14 or higher) installed
- ✅ npm (comes with Node.js)

## Step-by-Step Setup

### Step 1: Install Node.js Dependencies

Open your terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages:
- express (web server)
- mysql2 (MySQL driver)
- cors (cross-origin resource sharing)
- dotenv (environment variables)
- body-parser (request parsing)
- express-validator (input validation)

**Expected output:** You should see packages being downloaded and installed. Wait until you see a success message.

---

### Step 2: Create `.env` File from Template

Copy the example environment file to create your `.env` file:

```bash
cp env.example .env
```

Or on Windows PowerShell:
```powershell
Copy-Item env.example .env
```

Or manually:
- Copy `env.example` and rename it to `.env`

---

### Step 3: Configure `.env` File

Open the `.env` file in a text editor and update it with your MySQL database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=barista_cafe

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

**Important:** Replace the following values:
- `your_actual_mysql_password` - Enter your MySQL root password (or the password for the user you want to use)
- If you're using a different database user, change `DB_USER=root` to your username
- If your MySQL is on a different host, change `DB_HOST=localhost`
- `FRONTEND_URL` - Leave as `http://localhost:8080` for local development, or change if serving frontend from a different URL

**Example `.env` file:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=MySecurePassword123
DB_NAME=barista_cafe
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

---

### Step 4: Verify MySQL Connection

Before proceeding, make sure your MySQL database is running:

**On Windows:**
```bash
# Check if MySQL service is running
# Open Services (services.msc) and look for MySQL service
```

**On Linux/Mac:**
```bash
sudo systemctl status mysql
```

Test your MySQL connection with your credentials:
```bash
mysql -u root -p
```

Enter your password when prompted. If you can connect successfully, you're ready to proceed.

---

### Step 5: Initialize the Database

The project includes a script that will:
- Create the `barista_cafe` database (if it doesn't exist)
- Create all required tables (bookings, menu_items, admin_users)
- Insert sample menu items

Run the initialization script:

```bash
npm run init-db
```

**Expected output:**
```
Connected to MySQL server
Database 'barista_cafe' created or already exists
Bookings table created
Menu items table created
Sample menu items inserted
Admin users table created
Database initialization completed successfully!
Database setup complete
```

**If you see errors:**
- Check your `.env` file credentials are correct
- Verify MySQL is running
- Make sure the user specified in `DB_USER` has permission to create databases

---

### Step 6: Start the Backend Server

You have two options to start the server:

#### Option A: Development Mode (with auto-restart)

```bash
npm run dev
```

This uses `nodemon` which automatically restarts the server when you make code changes.

#### Option B: Production Mode

```bash
npm start
```

Or directly:
```bash
node server.js
```

**Expected output:**
```
Database connected successfully
Barista Cafe API server running on port 3000
Health check: http://localhost:3000/api/health
```

**Keep this terminal window open** - the server needs to keep running.

**To verify the server is working:**
- Open a new terminal/command prompt
- Run: `curl http://localhost:3000/api/health`
- Or open in browser: `http://localhost:3000/api/health`
- You should see: `{"status":"OK","message":"Barista Cafe API is running"}`

---

### Step 7: Serve the Frontend

Open a **new terminal window** (keep the backend server running) and navigate to the frontend directory:

#### Option 1: Using Python (Recommended - if Python is installed)

```bash
cd 2137_barista_cafe
python -m http.server 8080
```

For Python 2:
```bash
python -m SimpleHTTPServer 8080
```

#### Option 2: Using Node.js http-server

First install http-server globally:
```bash
npm install -g http-server
```

Then serve:
```bash
cd 2137_barista_cafe
http-server -p 8080
```

#### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `2137_barista_cafe/index.html`
3. Select "Open with Live Server"

**Expected output (for Python/Node.js options):**
```
Serving HTTP on 0.0.0.0 port 8080 ...
```

**Keep this terminal window open** as well.

---

### Step 8: Access the Application

Once both servers are running:

1. **Main Website:** Open your browser and go to:
   ```
   http://localhost:8080
   ```

2. **Reservation Page:** Click on "Reservation" link or go to:
   ```
   http://localhost:8080/reservation.html
   ```

3. **Admin Panel:** Open:
   ```
   http://localhost:8080/../admin.html
   ```
   Or directly: `admin.html` (if opened from file system)

4. **API Health Check:**
   ```
   http://localhost:3000/api/health
   ```

---

## Verifying Everything Works

### Test the Backend API

1. **Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"OK","message":"Barista Cafe API is running"}`

2. **Test Database Connection:**
   Check the terminal running `npm start` or `npm run dev` - you should see "Database connected successfully" when it starts.

3. **Get Menu Items:**
   ```bash
   curl http://localhost:3000/api/menu
   ```
   Should return a JSON array of menu items.

### Test the Frontend

1. Open `http://localhost:8080` in your browser
2. Navigate to the reservation page
3. Try filling out the booking form
4. Submit a test booking
5. Check the admin panel to see if the booking appears

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Verify MySQL is running
2. Check your `.env` file - ensure `DB_PASSWORD` matches your MySQL root password
3. Test MySQL connection manually: `mysql -u root -p`
4. Make sure `DB_HOST`, `DB_USER`, and `DB_NAME` are correct

### Issue: "Port 3000 already in use"

**Solution:**
1. Find what's using port 3000:
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   
   # On Linux/Mac
   lsof -i :3000
   ```
2. Kill the process or change `PORT` in your `.env` file to a different port (e.g., `3001`)

### Issue: "Port 8080 already in use"

**Solution:**
- Use a different port for the frontend server (e.g., `python -m http.server 8081`)
- Update `FRONTEND_URL` in `.env` to match (e.g., `http://localhost:8081`)

### Issue: CORS errors in browser console

**Solution:**
- Ensure `FRONTEND_URL` in `.env` matches exactly where you're serving the frontend
- Make sure backend server is running
- Check that both servers are accessible

### Issue: Cannot access backend via curl or browser (connection refused/timeout)

**Symptoms:**
- Server shows it's running but `curl http://localhost:3000/api/health` fails
- Browser can't connect to `http://localhost:3000/api/health`
- Connection refused or timeout errors

**Solution:**

1. **Restart the server** after the latest code update (the server now listens on `0.0.0.0`):
   - Stop the server (Ctrl + C)
   - Start it again: `npm start` or `npm run dev`
   - Look for the message: `Server is accessible from all network interfaces`

2. **Verify server is actually running:**
   ```bash
   # Check if the process is running
   # On Windows
   netstat -ano | findstr :3000
   
   # On Linux/Mac
   lsof -i :3000
   # or
   sudo netstat -tlnp | grep :3000
   ```

3. **Check firewall rules (if on Linux/server):**
   ```bash
   # Ubuntu/Debian - check ufw status
   sudo ufw status
   
   # Allow port 3000 if firewall is active
   sudo ufw allow 3000/tcp
   
   # For EC2 - check Security Groups in AWS Console
   # Ensure inbound rule allows port 3000 from your IP or 0.0.0.0/0
   ```

4. **If accessing from another machine:**
   - Use the server's IP address instead of localhost:
     ```bash
     curl http://SERVER_IP:3000/api/health
     ```
   - Replace `SERVER_IP` with your actual server IP or EC2 public IP

5. **If on EC2 AWS:**
   - Check Security Group inbound rules
   - Ensure port 3000 is open (Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 or your IP)

6. **Test locally first:**
   ```bash
   # On the same machine as the server
   curl http://localhost:3000/api/health
   curl http://127.0.0.1:3000/api/health
   
   # If localhost works but external doesn't, it's a firewall/network issue
   ```

7. **Check server logs:**
   - Look at the terminal where server is running
   - Check for any error messages
   - Verify you see: `Database connected successfully` and `Barista Cafe API server running on 0.0.0.0:3000`

### Issue: "Database 'barista_cafe' doesn't exist"

**Solution:**
- Run `npm run init-db` again
- Check that the MySQL user has CREATE DATABASE permissions
- Verify database was created: `mysql -u root -p -e "SHOW DATABASES;"`

### Issue: Tables not created

**Solution:**
- Run `npm run init-db` again (it's safe to run multiple times)
- Check the terminal output for any error messages
- Verify you can connect to MySQL with your credentials

---

## Stopping the Servers

To stop the servers:
1. Go to the terminal running the backend server
2. Press `Ctrl + C` to stop it
3. Go to the terminal running the frontend server
4. Press `Ctrl + C` to stop it

---

## Next Steps

Once everything is working:

1. **Make a test booking** through the reservation form
2. **Check the admin panel** to see your booking
3. **Update booking status** in the admin panel
4. **Explore the API** using tools like Postman or browser developer tools

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL host address | `localhost` | Yes |
| `DB_USER` | MySQL username | `root` | Yes |
| `DB_PASSWORD` | MySQL password | - | Yes |
| `DB_NAME` | Database name | `barista_cafe` | Yes |
| `PORT` | Backend server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8080` | Yes |

---

## Summary Checklist

- [ ] Installed Node.js dependencies (`npm install`)
- [ ] Created `.env` file from `env.example`
- [ ] Updated `.env` with MySQL credentials
- [ ] Verified MySQL is running
- [ ] Initialized database (`npm run init-db`)
- [ ] Started backend server (`npm start` or `npm run dev`)
- [ ] Started frontend server (Python/Node.js/Live Server)
- [ ] Verified API health check works
- [ ] Opened website in browser
- [ ] Tested booking form
- [ ] Verified admin panel access

---

**Need Help?** Check the main `README.md` or `DEPLOYMENT.md` for additional information.

