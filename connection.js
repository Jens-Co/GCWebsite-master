import mysql from 'mysql2';
import util from 'util';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSERNAME,
  port: 3036,
  password: process.env.DBPASSWORD,
  database: "gcbots"
});

connection.query = util.promisify(connection.query).bind(connection);

const getData = () => {
  return connection.query('SELECT * FROM mcxb');
};

const updateDate = (gamertag) => {
  const date = new Date().toISOString().split('T')[0];
  const sql = `UPDATE mcxb SET DATE = '${date}' WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

const updatePremium = (gamertag) => {
  const sql = `UPDATE mcxb SET PREMIUM = 1 WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

const updateAdmin = (gamertag) => {
  const sql = `UPDATE mcxb SET ADMIN = 1 WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

const updateBotName = (gamertag, input) => {
  const sql = `UPDATE mcxb SET BOTNAME = '${input}' WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

const updateDiscordID = (gamertag, id) => {
  const sql = `UPDATE mcxb SET DISCORDID = '${id}' WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

const profileLookUp = (gamertag) => {
  const sql = `SELECT * FROM mcxb WHERE NAME = '${gamertag}'`;
  return connection.query(sql);
};

export {
  connection,
  getData,
  updateDate,
  updatePremium,
  updateAdmin,
  updateBotName,
  updateDiscordID,
  profileLookUp
};