const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing=  require("../models/listing.js");

main()
.then(()=>{
    console.log("Successfully connected to mongodb");
})
.catch((err)=>{
    console.error("Failed to connect");
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Nestro');
}

const initDb = async ()=>{
    try{
        await Listing.deleteMany({}); //if there is any random data , then to clean 
        //instead of creating owner for every listing in data , we can use map method . which creates a new array with owner assigning an object
        initData.data = initData.data.map((obj)=>({
            ...obj,
            owner:"68269a4764789c097cbb3e9a",
            category: obj.category || "Trending",
        }));
        await Listing.insertMany(initData.data);
        console.log("db is initialised");
    }catch(err){
        console.log("error during db initialization");
    }
};
initDb();