const express=require("express");
const {UserModel}=require("../models/users.model");
const {auth}=require("../middlewares/auth.middleware")
const jwt=require("jsonwebtoken")
const bcrypt = require('bcrypt');
const userRoute=express.Router()

//user register create

userRoute.post("/register",async(req,res)=>{
    const {firstName,lastName,password,email}=req.body


    try {
        const exist=await UserModel.findOne({email})
            if(exist){
                res.status(400).send({"msg":"Email already exist!"})
            }else{

                bcrypt.hash(password, 5, (err, hash) =>{
                    const user= new UserModel({firstName,lastName,email,password:hash})
                    user.save();
                    res.send("Registration successfull")
                });
            }

        
    } catch (error) {
        res.send(error)
    }
})

//user login read

userRoute.post("/login",async(req,res)=>{
    const {password,email}=req.body
        const user=await UserModel.findOne({email})
        // console.log(user);
        if(user){
            try {
                bcrypt.compare(password, user.password, (err, result)=> {
                   if(result){
                    const token=jwt.sign({firstName: user.firstName,lastName:user.lastName,userID:user._id }, "users")
                        res.send({"msg":"login successful","token":token,"email":user.email,"name":user.firstName+" "+user.lastName})
                      
                   }else{
                    res.send({"msg":"Incorrect password!"})
                   }
                });
                
            } catch (error) {
                res.send(error)
            }

        }else{
            res.send({"msg":"User not found!"})
        }
    
})

//read users
userRoute.use(auth)
userRoute.get("/",async(req,res)=>{
    try {
        const data=await UserModel.find()
        res.send(data)
    } catch (error) {
        res.send(error
            )
    }
})
//delete users
userRoute.use(auth)
userRoute.delete("/delete/:id",async(req,res)=>{
    const {id}=req.params
    try {
        await UserModel.findByIdAndDelete({_id:id})
        res.send({"msg":`${id} deleted successfull`})
    } catch (error) {
        res.send(error)
    }
})






module.exports={
    userRoute
}