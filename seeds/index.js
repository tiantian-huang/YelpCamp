const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors}  = require('./seedHelpers');
const Campground = require('../models/campground');

// mongoose.connect('mongodb://localhost:27017/yelp-camp');
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];//传入一个数组后返回数组内任一元素

const seedDB = async () => {
    await Campground.deleteMany({});//删除原来所有的
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '63f877f72811e05ae23c4832',
            location:`${cities[random1000].city},${cities[random1000].state}`,//随机组合城市名和州名
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1678050490/YelpCamp/bzqghdqa22hnf7njp0qp.jpg',
                  filename: 'YelpCamp/bzqghdqa22hnf7njp0qp',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1677401845/YelpCamp/trdc37kwb9frkj9ww4a6.jpg',
                  filename: 'YelpCamp/trdc37kwb9frkj9ww4a6',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1677400383/YelpCamp/q5cqdyqfrfarenqpkpl9.jpg',
                  filename: 'YelpCamp/q5cqdyqfrfarenqpkpl9',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1678050738/YelpCamp/photo-1533873984035-25970ab07461_pub616.jpg',
                  filename: 'YelpCamp/photo-1533873984035-25970ab07461_pub616',
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then(() =>{
    mongoose.connection.close();
})