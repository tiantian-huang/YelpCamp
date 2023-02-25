//MVC: Model–view–controller view-client see controller：render views and working with models
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });//实例化。包含forward and reverse geocode方法
const { cloudinary } = require("../cloudinary");

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});//列出所有
    res.render('campgrounds/index', { campgrounds })//传入campgrounds
}

module.exports.renderNewForm =  (req, res) => {//new要放在：id前面，不然new会被当成id处理
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res) =>{
    //查看req.body是否包含campground：if(!req.body.campground) throw new ExpressError('Invalid campground Data',400);
    // 在把数据保存到mongoose之前进行validate：
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));//files是一个array，含有一些对象，每个对象里包含所有上传的图片文件的url和filename。保存到campground
    campground.author = req.user._id;//req.user会被自动加入
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.showCampground = async (req,res) => {//poplate reviews使其在页面显示
    const campground = await Campground.findById(req.params.id).populate({//nested populate
        path: 'reviews',//populate all the reviews from review array on the campground found by ID
        populate: {
            path: 'author'//review's author
        }
    }).populate('author');//campground's author
    if(!campground){//输入已删除的campground地址时，redirect到展示页
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){//输入已删除的campground地址时，redirect到展示页
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//spread operator
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);//从array中取出数据，将其push到images, 从而不覆盖原有图像，而是继续添加
    await campground.save();
    if (req.body.deleteImages) {//仅当有元素需要删除时
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);//在cloudinary删除文件
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        //pull：从数组images中取出元素，其filename为req.body.deleteImages数组中的元素
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground!');
    res.redirect('/campgrounds');
}
