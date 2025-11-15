import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async initialize() {
    if (this.isConnected) {
      return this.connection;
    }

    try {
      const connectionString = process.env.DB_CONNECTION_STRING;

      if (!connectionString) {
        throw new Error("DB_CONNECTION_STRING environment variable is not set");
      }

      // Parse the connection string
      const url = new URL(connectionString);

      // SSL configuration
      const sslConfig = {
        ca: fs.readFileSync(path.join(__dirname, "../../dbCert.pem")),
        rejectUnauthorized: true,
      };

      // Create connection configuration
      const config = {
        host: url.hostname,
        port: Number.parseInt(url.port, 10),
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Remove leading slash
        ssl: sslConfig,
        // Connection pool settings for better performance
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
      };

      // Create connection pool
      this.connection = mysql.createPool(config);

      // Test the connection
      await this.testConnection();

      this.isConnected = true;
      console.log("Database connection established successfully");
      return this.connection;
    } catch (error) {
      console.error("Failed to initialize database connection:", error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const [rows] = await this.connection.execute("SELECT 1 as test");
      if (rows[0].test !== 1) {
        throw new Error("Database test query failed");
      }
    } catch (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  async query(sql, params = []) {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call initialize() first.");
    }

    try {
      const [rows, fields] = await this.connection.execute(sql, params);
      return { rows, fields };
    } catch (error) {
      console.error("Database query error:", error.message);
      throw error;
    }
  }

  async getConnection() {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call initialize() first.");
    }
    return this.connection;
  }

  async close() {
    if (this.connection && this.isConnected) {
      await this.connection.end();
      this.isConnected = false;
      this.connection = null;
      console.log("Database connection closed");
    }
  }

  // Transaction support
  async beginTransaction() {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call initialize() first.");
    }

    const conn = await this.connection.getConnection();
    await conn.beginTransaction();
    return conn;
  }

  // Health check method
  async healthCheck() {
    try {
      await this.testConnection();
      return { status: "healthy", connected: true };
    } catch (error) {
      return { status: "unhealthy", connected: false, error: error.message };
    }
  }
}

// Create singleton instance
const dbService = new DatabaseService();

export default dbService;

// Export convenience functions for direct use
export const initializeDatabase = () => dbService.initialize();
export const query = (sql, params) => dbService.query(sql, params);
export const getDatabaseConnection = () => dbService.getConnection();
export const closeDatabase = () => dbService.close();
export const beginTransaction = () => dbService.beginTransaction();
export const databaseHealthCheck = () => dbService.healthCheck();
