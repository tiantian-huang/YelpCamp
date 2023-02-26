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
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1676707087/YelpCamp/dutwfx76ghztlw9pfifb.jpg',
                  filename: 'YelpCamp/dutwfx76ghztlw9pfifb',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1676707088/YelpCamp/t1py5sqtsavphicw2bkf.jpg',
                  filename: 'YelpCamp/t1py5sqtsavphicw2bkf',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1676707088/YelpCamp/xl1yd7ksl4wtrbhombmt.jpg',
                  filename: 'YelpCamp/xl1yd7ksl4wtrbhombmt',
                },
                {
                  url: 'https://res.cloudinary.com/dirdgi8hi/image/upload/v1676707089/YelpCamp/kykgj57n8ivu0ww71lku.jpg',
                  filename: 'YelpCamp/kykgj57n8ivu0ww71lku',
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then(() =>{
    mongoose.connection.close();
})