var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const usersRouter = require('./routes/usersAccount')
const memberRouter = require('./routes/membersAccount')
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order')
const joinusRouter = require('./routes/joinUs')

const todoRouter = require('./routes/todoRouter');

const cors = require('cors');

var app = express();

// 允许所有来源的跨域请求
// app.use(cors({ origin: 'http://localhost:5173' }));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/members', memberRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/joinUs', joinusRouter);

// 提供靜態文件夾，讓前端可以訪問上傳的圖片
app.use('/img', express.static('img'));

// app.use('/todos', todoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
