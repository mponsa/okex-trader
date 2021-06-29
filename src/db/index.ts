import * as dotenv from 'dotenv';
import {Sequelize} from 'sequelize';
dotenv.config();

const db = 'trader';
const username = process.env.USERNAME || '';
const password = process.env.PASSWORD || '';

export const sequelize = new Sequelize(db, username, password, {
  host: process.env.NODE_ENV === 'development' ? '127.0.0.1' :'tradersql',
  dialect: "mysql",
  port: 3306,

});

sequelize.authenticate();

