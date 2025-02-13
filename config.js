require('dotenv').config(); // 加載 .env 文件中的環境變量

// module.exports = {
//   jwtSecret: process.env.JWT_SECRET,
//   // 你可以在這裡添加更多的配置項目

//   development: {
//     username: 'root',  // PostgreSQL 用戶名稱
//     password: 'OIsqdeOnTxiiRga3ShXjh0mFy4QNZ6fO',  // PostgreSQL 密碼
//     database: 'project01_node02_5jet',  // PostgreSQL 資料庫名稱
//     host: 'dpg-ctovcmlsvqrc73bbnafg-a.singapore-postgres.render.com', // PostgreSQL 伺服器主機
//     port: 5432,                 // PostgreSQL 預設端口
//     dialect: 'postgres',        // 使用 PostgreSQL 資料庫
//   },
// };

// 確保在此處正確導出 config
const config = {
  jwtSecret: process.env.JWT_SECRET,
  development: {
    username: 'root',  // PostgreSQL 用戶名稱
    password: 'Q2Kxe3PDOhskU7ZyohOdz5hHsVoWATFt',  // PostgreSQL 密碼
    database: 'project01_node02_z5wr',  // PostgreSQL 資料庫名稱
    host: 'dpg-cueksg5svqrc73e100p0-a.singapore-postgres.render.com', // PostgreSQL 伺服器主機
    port: 5432,                 // PostgreSQL 預設端口
    dialect: 'postgres',        // 使用 PostgreSQL 資料庫
  },
};

module.exports = config;