const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);//campground schema中的review属性里有reviews array
    await review.save();
    await campground.save();
    req.flash('success','Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;//获取路径中的id和reviewId
    //pull:从array从移除所有符合条件的值.将id为reviewId的移出数组reviews（从mongodb）
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}