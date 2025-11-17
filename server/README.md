# Database Service

This service provides a singleton MySQL database connection that can be used throughout the application.

## Setup

1. Ensure you have `DB_CONNECTION_STRING` in your `.env` file
2. Place your SSL certificate (`dbCert.pem`) in the server root directory
3. The database connection is automatically initialized when the server starts

## Usage

### Import the service

```javascript
import { query, getDatabaseConnection } from './services/database.service.js';
```

### Execute queries

```javascript
// Simple query with parameters
const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
console.log(result.rows); // Array of result rows
console.log(result.fields); // Column information

// Complex query
const result = await query(`
  SELECT u.name, p.title
  FROM users u
  JOIN posts p ON u.id = p.user_id
  WHERE u.active = ?
`, [true]);
```

### Get raw connection (for transactions, etc.)

```javascript
const connection = await getDatabaseConnection();

// Use connection pool directly
await connection.execute('INSERT INTO users SET ?', { name: 'John', email: 'john@example.com' });
```

### Transaction support

```javascript
import { beginTransaction } from './services/database.service.js';

const conn = await beginTransaction();
try {
  await conn.execute('INSERT INTO users SET ?', { name: 'John' });
  await conn.execute('INSERT INTO profiles SET ?', { user_id: 1, bio: 'Hello' });
  await conn.commit();
} catch (error) {
  await conn.rollback();
  throw error;
} finally {
  conn.release();
}
```


## Connection Details

- **Host**: Parsed from DB_CONNECTION_STRING
- **SSL**: Enabled with certificate from `dbCert.pem`
- **Connection Pool**: 10 connections maximum
- **Timeouts**: 60 seconds for acquire and query timeouts