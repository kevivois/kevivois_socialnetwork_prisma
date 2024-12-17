import express from "express"
import PrismaSingleton from '../Connection.js'; // Adjust the path to your file if needed

import  {encryptPassword} from "../utils/encryption.utils.js";
import passport from "passport";

import {checkAuthenticated} from "../middleware/auth/checkAuth.js"

const router = express.Router()

const client = new PrismaSingleton().client;


router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true, // Use connect-flash for flash messages (optional)
}));
  
  // Logout Route
router.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).send('Logout failed');
        res.send('Logged out successfully');
    });
});

router.get("/isAuth",(req,res) => {
    if(req.isAuthenticated()){
        return res.send({
            "message":"i am authenticated"
        })
    }
    return res.send({
        "message":"i am not authenticated"
    })
})

  
router.post("/create",async (req,res) => {
    try{
        if(!req.body.username || !req.body.password)
        {   
            throw new Error("undefined variables in body for /create")
        }
        let user = await client.user.findFirst({
            where:{
                username:req.body.username,
            }
        })
        if(!user){
            user = await client.user.create({
                data:{
                    username:req.body.username,
                    password:encryptPassword(req.body.password)
                }
            })
            return res.send({"message":"user successfully created",user:user})
        }else{
            return res.send({"message":"username already existing"})
        }

    }catch(e){
        console.log(e)
        return res.sendStatus(400)
    }
})

export default router;