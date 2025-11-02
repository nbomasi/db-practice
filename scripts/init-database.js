const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        // Connect to MySQL server (without specifying database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'barista_cafe';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' created or already exists`);

        // Use the database
        await connection.query(`USE \`${dbName}\``);

        // Create bookings table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                booking_date DATE NOT NULL,
                booking_time TIME NOT NULL,
                number_of_people INT NOT NULL,
                special_requests TEXT,
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_date_time (booking_date, booking_time),
                INDEX idx_status (status)
            )
        `);
        console.log('Bookings table created');

        // Create menu_items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category ENUM('breakfast', 'coffee', 'dessert', 'beverage') NOT NULL,
                is_available BOOLEAN DEFAULT TRUE,
                is_recommended BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_available (is_available)
            )
        `);
        console.log('Menu items table created');

        // Insert sample menu items
        const menuItems = [
            // Breakfast items
            { name: 'Pancakes', description: 'Fresh brewed coffee and steamed milk', price: 12.50, category: 'breakfast' },
            { name: 'Toasted Waffle', description: 'Brewed coffee and steamed milk', price: 12.00, category: 'breakfast' },
            { name: 'Fried Chips', description: 'Rich Milk and Foam', price: 15.00, category: 'breakfast', is_recommended: true },
            { name: 'Banana Cakes', description: 'Rich Milk and Foam', price: 18.00, category: 'breakfast' },
            
            // Coffee items
            { name: 'Latte', description: 'Fresh brewed coffee and steamed milk', price: 7.50, category: 'coffee' },
            { name: 'White Coffee', description: 'Brewed coffee and steamed milk', price: 5.90, category: 'coffee', is_recommended: true },
            { name: 'Chocolate Milk', description: 'Rich Milk and Foam', price: 5.50, category: 'coffee' },
            { name: 'Greentea', description: 'Fresh brewed coffee and steamed milk', price: 7.50, category: 'coffee' },
            { name: 'Dark Chocolate', description: 'Rich Milk and Foam', price: 7.25, category: 'coffee' }
        ];

        for (const item of menuItems) {
            await connection.execute(
                `INSERT IGNORE INTO menu_items (name, description, price, category, is_recommended) VALUES (?, ?, ?, ?, ?)`,
                [item.name, item.description, item.price, item.category, item.is_recommended || false]
            );
        }
        console.log('Sample menu items inserted');

        // Create admin_users table for future admin functionality
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'manager') DEFAULT 'admin',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Admin users table created');

        console.log('Database initialization completed successfully!');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization if this script is executed directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database setup complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = initDatabase;
