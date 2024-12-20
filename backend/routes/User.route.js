import express from "express"
import PrismaSingleton from '../Connection.js'; // Adjust the path to your file if needed

import  {encryptPassword} from "../utils/encryption.utils.js";
import * as HttpsCode from "../HttpsCode.js"
import {checkAuthenticated} from "../middleware/auth/checkAuth.js"
import * as UserHelper from "./User.route.utils.js"



const router = express.Router()

const client = new PrismaSingleton().client;

router.get("/me",[checkAuthenticated],async (req,res) => {
    let userId = req.user.id;
    let user = await client.user.findFirst({
        where:{
            id:userId
        }
    })
    if(user){
        return res.status(HttpsCode.SUCESS).json({
            user:user
        })
    }else{
        return res.sendStatus(HttpsCode.RECOURCE_NOT_FOUND);
    }
})

router.get("/conversations", [checkAuthenticated], async (req, res) => {
    try {
        let userId = req.user.id;

        let conversations = await client.conversation.findMany({
            where: {
                users: {
                    some: { id: userId } // Filter to include only conversations where the authenticated user is a participant
                }
            },
            include: {
                users: { // Include details of all users in the conversation
                    select: {
                        id: true,
                        username: true
                    }
                },
                messages: { // Optionally include the messages in the conversation
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 10 
                }
            },
            orderBy: {
                id: "asc"
            }
        });

        res.status(200).json({ conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve conversations" });
    }
});

router.post("/conversations/create", [checkAuthenticated], async (req, res) => {
    try {
        const { title, description, userIds } = req.body;
        const creatorId = req.user.id;

        const conversation = await client.conversation.create({
            data: {
                title,
                Description:description,
                users: {
                    connect: [{ id: creatorId }] // The creator is added as a user
                },
                admins: {
                    connect: [{ id: creatorId }] // The creator is also added as an admin
                }
            }
        });
        if (userIds != null && userIds.length > 0) {
            const invitedUsers = [];
            if(await UserHelper.areFriends(creatorId, userIds)){
                for (const userId of userIds) {
                        invitedUsers.push({ id: userId });
                        // Optionally, create a notification for the invited user
                        await client.notification.create({
                            data: {
                                type: client.NotificationType.GROUP_INVITATION,
                                userId: userId,
                                content: `${req.user.username} invited you to a new conversation.`,
                                relatedConvId: conversation.id
                            }
                        });
                }
            }
            if (invitedUsers.length > 0) {
                await client.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        invitedUsers: {
                            connect: invitedUsers
                        }
                    }
                });
            }
        }


        res.status(201).json({ message: "Conversation created", conversation });
    } catch (error) {
        console.error(error);
        res.status(HttpsCode.BAD_REQUEST).json({ error: "Failed to create conversation" });
    }
});




export default router;