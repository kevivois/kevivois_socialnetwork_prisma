import express from "express"
import PrismaSingleton from '../Connection.js'; // Adjust the path to your file if needed

import  {encryptPassword} from "../utils/encryption.utils.js";
import passport from "passport";
import * as HttpsCode from "../HttpsCode.js"
import {checkAuthenticated} from "../middleware/auth/checkAuth.js"
const router = express.Router()

const client = new PrismaSingleton().client;


router.post('/login', passport.authenticate('local', {
    failureFlash: true // Utilisez flash pour les messages d'erreur (optionnel)
}), (req, res) => {
    if (req.isAuthenticated()) {
        res.status(HttpsCode.ACCEPTED).json({
            user: req.user
        });
    } else {
        res.status(HttpsCode.UNAUTHORIZED).json({ message: 'Authentication failed' });
    }
});
  
  // Logout Route
router.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) return res.status(HttpsCode.SERVER_ERROR).send('Logout failed');
        res.send('Logged out successfully');
    });
});

router.get("/isAuth",async (req,res) => {
    try{
        if(req.isAuthenticated()){
            let user = await client.user.findFirst({
                where:{
                    id:req.user.id
                }
            })
            return res.status(HttpsCode.SUCESS).send({
                "message":"i am authenticated",
                "auth":true,
                "user":user
            })
        }
    }catch(e){
        console.log(e)
    }
    return res.status(HttpsCode.UNAUTHORIZED).send({
        "message":"i am not authenticated",
        "auth":false,
        "user":null
    })

})

router.post("/create",async (req,res) => {
    try{
        if(!req.body.username || !req.body.password)
        {   
            return res.sendStatus(HttpsCode.BAD_REQUEST)
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
        return res.sendStatus(HttpsCode.SERVER_ERROR)
    }
})

export default router;