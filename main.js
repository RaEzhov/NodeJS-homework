const express = require('express');
const cors = require('cors');

const app = express();

let expenses = [];

app.use(express.json());
app.use(cors());

// установка лимита потраченных денег на день
let dayExpenseLimit = {};

// создание объекта расхода
app.post('/api/newExpense', (req, res) => {
    console.log('Запрос на создание объекта расхода');
    const { name, amount, date } = req.body;
    if (!name || !amount || !date) {
        return res.status(400).send('Не указаны все обязательные поля');
    }
    if (dayExpenseLimit[date]) {
        const dayExpenses = expenses.map(expense => expense.date === date ? Number(expense.amount) : 0);
        if (dayExpenses + Number(amount) > dayExpenseLimit[date]) {
            return res.status(200).send('Трата превышает лимит на этот день');
        }

    }
    const expense = { name, amount, date };
    expenses.push(expense);
    return res.status(201).send('Расход успешно добавлен');
});

// получение всех трат
app.get('/api/expenses', (req, res) => {
    console.log('Запрос на получение всех трат');
    return res.status(200).json(expenses);
});

// поиск трат за конкретный день
app.post('/api/dayExpenses', (req, res) => {
    console.log('Запрос на получение трат за конкретный день');
    const { date } = req.body;
    if (!date) {
        return res.status(400).send('Не указан день');
    }
    const dayExpenses = expenses.filter((expense) => expense.date === date);
    return res.status(200).json(dayExpenses);
});

app.post('/api/dayExpenseLimit', (req, res) => {
    console.log('Запрос на установку лимита трат на день');
    const { date, limit } = req.body;
    if (!date || !limit) {
        return res.status(400).send('Не указаны все обязательные поля');
    }
    dayExpenseLimit[date] = limit;
    return res.status(201).send('Лимит трат на день успешно установлен');
});

// получение лимита трат за день
app.get('/api/dayExpenseLimit/:date', (req, res) => {
    console.log('Запрос на получение лимита трат на день');
    const date = req.params.date;
    const limit = dayExpenseLimit[date];
    if (!limit) {
        return res.status(404).send(`Для дня ${date} не установлен лимит`);
    }
    return res.status(200).json({ limit });
});

app.listen(8080, () => {
    console.log('Сервер запущен на порте 8080');
});
