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

// promise wrapper to enable async await with MYSQL
connection.query = util.promisify(connection.query).bind(connection);

const getData = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM mcxb', (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const updateDate = (gamertag) => {
  return new Promise((resolve, reject) => {
    var date = (new Date()).toISOString().split('T')[0];
    var sql = "UPDATE mcxb SET DATE ='" + date + "' WHERE NAME='" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const updatePremium = (gamertag) => {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE mcxb SET PREMIUM ='" + 1 + "' WHERE NAME='" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const updateAdmin = (gamertag) => {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE mcxb SET ADMIN ='" + 1 + "' WHERE NAME='" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const updateBotName = (gamertag, input) => {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE mcxb SET BOTNAME ='" + input + "' WHERE NAME='" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const updateDiscordID = (gamertag, id) => {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE mcxb SET DISCORDID ='" + id + "' WHERE NAME='" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

const profileLookUp = (gamertag) => {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM mcxb WHERE NAME = '" + gamertag + "'"
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}
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