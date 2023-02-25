const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;//简化写法。不必每次使用mongoose.Schema

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});//virtual property，不储存在数据库，从已储存的信息衍生出来，假装的property。w_200宽度200的缩略图

const opts = { toJSON: { virtuals: true } };//By default, mongoose does not include virtuals when you convert a document to JSON.
//To include virtuals in res.json(), you need to set the toJSON schema option to {virtuals: true}

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],//类型必须为point
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function(doc){//query middleware.
    //post：在delete后执行。删除并传入刚刚删除的document
    if(doc){ //如果删除了一些东西
        await Review.deleteMany({
            _id:{
                $in: doc.reviews// 删除所有在刚刚删除的doc里的reviews array里的review
            }
        })

    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);//生成campground的model
