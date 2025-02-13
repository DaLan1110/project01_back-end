const todoModel = require('../models/todosModel');

// exports.getAllTodos = (req, res) => {
//     const todos = todoModel.getAll()
//     res.send(todos)
// }

// exports.getTodoById = (req, res) => {
//     const { id } = req.params;
//     const todo = todoModel.getOne(id);
//     if (!todo) {
//         return res.status(404).send({
//             message: 'Todo is not found'
//         })
//     }
//     res.send(todo);
// }

// exports.createTodo = (req, res) => {
//     // 驗證
//     if (!req.body.title) {
//         return res.status(400).send({ message: '缺少 title 欄位' })
//     }

//     if (typeof req.body.title !== 'string') {
//         return res.status(400).send({ message: 'title 欄位格式錯誤' })
//     }

//     const newTodo = {
//         title: req.body.title,
//         completed: req.body.completed || false
//     }
//     const todo = todoModel.create(newTodo)

//     res.send(todo)
// }

// exports.updateTodo = (req, res) => {
//     const { id } = req.params;
//     const todo = todoModel.update(id, req.body);
//     if (!todo) {
//         return res.status(404).send({
//             message: 'Todo 不存在'
//         })
//     }
//     res.send(todo)
// }

// exports.deleteTodo = (req, res) => {
//     const { id } = req.params
//     const todo = todoModel.delete(id)
//     if (!todo) {
//         return res.status(404).send({
//             message: 'Todo 不存在'
//         })
//     }
//     res.send(todo)
// }

exports.getAllTodos = (req, res) => {
    todoModel.getAll((err, todos) => {
        if (err) {
            console.log('錯誤', err)
            res.status(500).send({
                message: '伺服器錯誤'
            })
            return
        }
        const todosWithBooleanCompleted = todos.map(todo => ({
            ...todo,
            completed: todo.completed === 1 // 轉換為布林值
        }));
        res.send(todosWithBooleanCompleted)
    })
}

exports.createTodo = (req, res) => {
    const { title, completed } = req.body;

    // 驗證傳入的資料
    if (!title || typeof title !== 'string') {
        return res.status(400).send({ message: '缺少 title 欄位或格式錯誤' });
    }

    const newTodo = {
        title,
        completed: completed || false  // 預設值為 false
    };

    // 呼叫資料庫模型來創建新的待辦事項
    todoModel.create(newTodo, (err, createdTodo) => {
        if (err) {
            console.error('新增待辦事項失敗: ', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        // 回應成功並回傳新建立的待辦事項
        res.status(201).send(createdTodo);
    });
}

exports.getTodoById = (req, res) => {
    // 從請求參數中獲取 ID
    const { id } = req.params;

    // 調用 todoModel 的 getOne 函數
    todoModel.getOne(id, (err, todo) => {
        if (err) {
            // 如果查詢發生錯誤，返回 500 伺服器錯誤
            console.error('查詢失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!todo) {
            // 如果找不到該待辦事項，返回 404 未找到
            return res.status(404).send({ message: 'Todo 不存在' });
        }

        // 轉換 completed 欄位為布林值
        const formattedTodo = {
            ...todo,
            completed: todo.completed === 1 // 轉換為布林值
        };

        // 返回找到的待辦事項
        res.send(formattedTodo);
    });
};

exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    // 驗證傳入的資料
    if (!updateFields.title || typeof updateFields.title !== 'string') {
        return res.status(400).send({ message: 'title 欄位格式錯誤' });
    }

    // 呼叫資料庫模型來更新待辦事項
    todoModel.update(id, updateFields, (err, updatedTodo) => {
        if (err) {
            console.error('更新待辦事項失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!updatedTodo) {
            return res.status(404).send({ message: 'Todo 不存在' });
        }

        // 返回更新後的待辦事項
        res.send(updatedTodo);
    });
};

exports.deleteTodo = (req, res) => {
    const { id } = req.params;

    // 呼叫資料庫模型來刪除待辦事項
    todoModel.deleteOne(id, (err, deletedTodo) => {
        if (err) {
            console.error('刪除待辦事項失敗:', err);
            return res.status(500).send({ message: '伺服器錯誤' });
        }

        if (!deletedTodo) {
            return res.status(404).send({ message: 'Todo 不存在' });
        }

        // 返回刪除的待辦事項
        res.send(deletedTodo);
    });
};