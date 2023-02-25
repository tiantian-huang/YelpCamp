const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/ campgrounds');//campgrounds object, representing campground controller, have many methods
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');//导入middleware
const multer = require('multer');
const { storage } = require('../cloudinary');//自动查找js文件，所以不用写.js
const upload = multer({ storage });

const Campground = require('../models/campground');
//define a single root and handle different verbs
//简化前：
// router.get('/', catchAsync(campgrounds.index));
// router.get('/new', isLoggedIn, campgrounds.renderNewForm);
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
// router.get('/:id', catchAsync(campgrounds.showCampground));
// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));
// router.delete('/:id',isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
//简化后：
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
   
//middleware multer add file to the request object, request files
//array（）多个文件，single（）单个文件

router.get('/new', isLoggedIn, campgrounds.renderNewForm)//必须放在router.route('/:id')前，不然‘new’会被当成一个id

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;