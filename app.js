if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}//process.env.NODE_ENV - environment variable, 一般为development或production。deploy后将在production模式运行。
//!== "production"即在development时使其可访问。Dotenv：隐藏文件，比如含有api key的文件。不能上传至github


const express = require('express');
const path = require('path');//请求路径
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');
//Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');//require contents of the file, the router

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!!!");
});


const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views')) //设置路径为views

app.use(express.urlencoded({extended:true})) //parse the post req body
app.use(methodOverride('_method'));//输入query string
// To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))
//将session储存在mongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,//单位：秒，即24小时。每24小时查看一次session数据是否更新，更新则保存
    crypto: {
        secret: 'squirrel'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {//之前储存在内存而不是mongoose中，server重启时会消失
    store,
    name:'session',//设置名字而不是用默认。增加安全性
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,//增加安全性. cookies are only accessible throught http, not javascript
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7//一周时间，单位毫秒（1秒=1000毫秒）
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());//to use persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));//authenticate:static method added automatically

passport.serializeUser(User.serializeUser());//generates a function that is used by passport to serialize users into session(store)
passport.deserializeUser(User.deserializeUser());//get user out of session(unstore)


app.use((req, res, next)=>{
    res.locals.currentUser = req.user;//在所有template中均可访问current user（login后user为登陆的user，否则为undefined）
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})//针对每个request的miidleware，设为locals后不用每次传入

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);//为campgorunds.js里的所有router地址添加/campgrounds前缀
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

// 404:无法识别的url时，需要放在最下面（没有任何匹配到时才会运行）。app.all针对所有请求，*针对所有路径
app.all('*',(req, res, next) => {
    next(new ExpressError('Page Not found',404))
})
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;// 从err中提取statusCode设置默认值为500
    if(!err.message) err.message = 'Oh No, Something went wrong!'
    //将statuscode设为该数字，并输出error模板, 将error（err）pass给错误模板error.ejs
    res.status(statusCode).render('error', {err})
})
app.listen(3000, () => {
    console.log('Serving on port 3000')
})