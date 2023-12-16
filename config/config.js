const fs = require("fs");
const { config } = require("dotenv");

config({ path: `.env` });

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432,
    dialect: process.env.DB_DIALECT,
    storage:
      process.env.DB_DIALECT == "sqlite" ? process.env.DB_STORAGE_PATH : "",
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432,
    dialect: process.env.DB_DIALECT,
    storage:
      process.env.DB_DIALECT == "sqlite" ? process.env.DB_STORAGE_PATH : "",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432,
    dialect: process.env.DB_DIALECT,
    storage:
      process.env.DB_DIALECT == "sqlite" ? process.env.DB_STORAGE_PATH : "",
    dialectOptions: {},
  },
};
