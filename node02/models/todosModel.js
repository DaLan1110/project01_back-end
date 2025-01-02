// user.js
// const mysql = require('mysql2');

// // 建立連線--------------------
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '2XuxgdrX318056!DaLan@',
//     database: 'project01_node02'
// })

// // 取得連接池的 Promise 物件
// const promisePool = pool.promise();

// // 驗證連接池是否正常工作
// async function checkConnection() {
//     try {
//         // 試著進行一次簡單的查詢
//         await promisePool.query('SELECT 1');
//         console.log('連接成功連接到資料庫 project01_node02 users');
//     } catch (err) {
//         console.error('連接池連接失敗 project01_node02: ', err.stack);
//     }
// }
// // 執行檢查
// checkConnection();
// // ----------------------------


// npm install mysql2 sequelize 連接資料庫需要

// const { v4: uuidv4 } = require('uuid')

// class TodoModel {
//     constructor() {
//         this.todos = [
//             {
//                 title: '這是預設資料',
//                 completed: false,
//                 id: uuidv4()
//             }
//         ]
//     }

//     // 取得全部
//     getAll() {
//         return this.todos;
//     }

//     // 取得單筆資料
//     getOne(id){
//         console.log('id 是', id);
//         return this.todos.find((todo) => todo.id === id)
//     }

//     // 新增資料
//     create(todo) {
//         const newTodo = {
//             ...todo,
//             id: uuidv4()
//         }
//         this.todos.push(newTodo);
//         return newTodo;
//     }

//     // 更新資料
//     update(id, updateFields){
//         const todo = this.getOne(id);
//         if(todo){
//             Object.assign(todo, updateFields)
//         }
//         return todo;
//     }

//     // 刪除資料
//     delete(id){
//         const index = this.todos.findIndex((todo) => todo.id === id);
//         if(index !== -1){
//             return this.todos.splice(index, 1)[0];
//         }
//     }
// }

// module.exports = new TodoModel()

const mysql = require('mysql2');

// 建立連線
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2XuxgdrX318056!DaLan@',
    database: 'my_test_project'
})

// 取得連接池的 Promise 物件
const promisePool = pool.promise();

// 驗證連接池是否正常工作
async function checkConnection() {
    try {
        // 試著進行一次簡單的查詢
        await promisePool.query('SELECT 1');
        console.log('連接池成功連接到資料庫 todolost');
    } catch (err) {
        console.error('連接池連接失敗 todolost: ', err.stack);
    }
}
// 執行檢查
checkConnection();

// 取得全部
function getAll(callback) {
    const query = 'SELECT * FROM todolist';
    pool.query(query, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// 新增
function create(newTodo, callback) {
    const query = 'INSERT INTO todolist (title, completed) VALUES (?, ?)';

    // 將布林值轉換為 0 或 1
    const completedValue = newTodo.completed === 'true' ? 1 : 0;
    console.log('Completed value:', completedValue);  // 調試信息

    // 執行資料庫查詢
    pool.query(query, [newTodo.title, completedValue], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 將結果返回給回調函數
        callback(null, { id: results.insertId, ...newTodo });
    });
}

// 取得單筆資料
function getOne(id, callback) {
    const query = 'SELECT * FROM todolist WHERE ID = ?';

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        // 如果找不到記錄，返回 null
        if (results.length === 0) {
            return callback(null, null);
        }
        // 將第一筆結果返回給回調函數
        callback(null, results[0]);
    });
}

// 更新資料
function update(id, updateFields, callback) {
    // 構建 SQL 查詢
    let query = 'UPDATE todolist SET title = ?, completed = ? WHERE id = ?';
    const completedValue = updateFields.completed ? 1 : 0; // 轉換布林值為 0 或 1
    const values = [updateFields.title, completedValue, id];

    // 執行資料庫查詢
    pool.query(query, values, (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 檢查是否有行被更新
        if (results.affectedRows === 0) {
            return callback(null, null); // 如果沒有行被更新，返回 null
        }

        // 查詢更新後的待辦事項
        pool.query('SELECT * FROM todolist WHERE id = ?', [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    });
}

// 刪除資料
function deleteOne(id, callback) {
    // 構建 SQL 查詢
    const query = 'DELETE FROM todolist WHERE id = ?';

    // 執行資料庫查詢
    pool.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        // 檢查是否有行被刪除
        if (results.affectedRows === 0) {
            return callback(null, null); // 如果沒有行被刪除，返回 null
        }

        // 返回刪除的項目
        callback(null, { id });
    });
}


module.exports = {
    getAll,
    create,
    getOne,
    update,
    deleteOne
}