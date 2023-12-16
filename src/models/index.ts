import { Sequelize } from 'sequelize';
import { Dialect } from 'sequelize';
 // Import your models
import UserModel from './User'; // Import your models
import * as pg from 'pg';  
require('dotenv').config();

// Use environment variables or hard code your database credentials
const dbConfig = {
  database: process.env.DB_NAME || 'database',
  username: process.env.DB_USER || 'username',
  password: process.env.DB_PASS || 'password',
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT as Dialect,
  storage:  process.env.DB_STORAGE_PATH
};

let configJson =  {};
if (dbConfig.dialect == 'sqlite'){
  configJson = {
    dialect: dbConfig.dialect,
    storage: dbConfig.storage
  }
} else {
  configJson = {
    host: dbConfig.host,
    dialectModule: pg,
    dialect: dbConfig.dialect,

  }
}
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  configJson
);


const User = UserModel(sequelize);

// Setup associations here, if any

// Export models and Sequelize for use in the application
export {  User };
export default sequelize;
