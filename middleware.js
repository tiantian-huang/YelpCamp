const {campgroundSchema, reviewSchema} = require('./schemas');//validate the data from req.body
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
module.exports.isLoggedIn = (req, res, next) => {//确认是否登陆以执行下一步操作的middleware
    if (!req.isAuthenticated()) {//passport自带功能
        req.session.returnTo = req.originalUrl// 储存他们在登陆前请求的网址，登陆后redirect到那个网址
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();//如果已认证，可以执行下一步
}

module.exports.validateCampground = (req, res, next) => {//middleware 
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        //for each element（el）, return the message, 逗号连接成string
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)//传入error handler(app.use((err, req, res, next))处理
    } else {
        next();//符合schema则进入下一步
    }
}
module.exports.isAuthor = async (req, res, next)=>{//授权是否有更改权限的middleware
    const {id} = req.params;//从url从获取id
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){//查看当前登陆用户id是否等于campground作者id
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next)=>{
    const {id, reviewId} = req.params;//campground id, review id
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){//查看当前登陆用户id是否等于review作者id
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);//redirect using campground id
    }
    next();
}

module.exports.validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        //for each element（el）, return the message, 逗号连接成string
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)//传入error handler(app.use((err, req, res, next))处理
    } else {
        next();//符合schema则进入下一步
    }
}