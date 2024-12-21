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
router.get("/conversations/:id",[checkAuthenticated],async (req,res) => {
    let convId = req.params.id;
    let conversation = await client.conversation.findFirst({
        where:{
            id:convId
        }
    })
    code = conversation ? HttpsCode.SUCESS: HttpsCode.RECOURCE_NOT_FOUND
        return res.status(code).json({
            conversation:conversation,
            message:conversation ? "" : "conversation not found"
    })
})
router.post("/conversations/:id/invite", async (req, res) => {
    const convId = req.params.id;

    try {
        const users = req.body.users;

        // Find the conversation
        const conversation = await client.conversation.findFirst({
            where: {
                id: convId
            },
            include: {
                invitedUsers: true
            }
        });

        if (!conversation) {
            return res.status(HttpsCode.RECOURCE_NOT_FOUND).json({ message: "Conversation not found" });
        }

        if (!users || users.length === 0) {
            return res.status(HttpsCode.BAD_REQUEST).json({ message: "No users to invite" });
        }

        const invitedUsers = conversation.invitedUsers.map(user => user.id);
        const userToInvite = [];

        for (const user of users) {
            if (invitedUsers.includes(user)) {
                continue; // Skip if the user is already invited
            }

            if (await UserHelper.areFriends(req.user.id, user)) {
                userToInvite.push({ id: user });

                // Create an invitation notification
                await client.notification.create({
                    data: {
                        type: "GROUP_INVITATION",
                        userId: user,
                        content: `${req.user.username} invited you to a conversation.`,
                        actorId: req.user.id,
                        relatedConvId: conversation.id
                    }
                });
            }
        }

        if (userToInvite.length > 0) {
            // Add new invited users to the conversation
            await client.conversation.update({
                where: { id: conversation.id },
                data: {
                    invitedUsers: {
                        connect: userToInvite
                    }
                }
            });
        }

        res.status(HttpsCode.SUCESS).json({
            message: "Users invited successfully",
            invitedUsers: userToInvite
        });
    } catch (error) {
        console.error(error);
        return res.status(HttpsCode.SERVER_ERROR).json({
            message: "Server error"
        });
    }
});
router.post("/conversation/:id/join", [checkAuthenticated], async (req, res) => {
    const convId = req.params.id;
    const userId = req.user.id;

    try {
        // Find the conversation with its invited users
        const conversation = await client.conversation.findFirst({
            where: {
                id: convId
            },
            include: {
                invitedUsers: true, 
                users: true 
            }
        });

        if (!conversation) {
            return res.status(HttpsCode.RECOURCE_NOT_FOUND).json({ message: "Conversation not found" });
        }

        const isAlreadyMember = conversation.users.some(user => user.id === userId);
        if (isAlreadyMember) {
            return res.status(HttpsCode.BAD_REQUEST).json({ message: "You are already a member of this conversation" });
        }

        const isInvited = conversation.invitedUsers.some(user => user.id === userId);
        if (!isInvited) {
            return res.status(HttpsCode.FORBIDDEN).json({ message: "You are not invited to join this conversation" });
        }

        // Add the user to the conversation
        await client.conversation.update({
            where: { id: convId },
            data: {
                users: {
                    connect: { id: userId }
                },
                invitedUsers: {
                    disconnect: { id: userId } // Remove the user from the invited list after joining
                }
            }
        });

        res.status(HttpsCode.SUCESS).json({ message: "You have successfully joined the conversation" });
    } catch (error) {
        console.error(error);
        res.status(HttpsCode.SERVER_ERROR).json({ message: "Server error" });
    }
});
router.get("/notifications", [checkAuthenticated], async (req, res) => {
    const userId = req.user.id;
    try{
        let notifications = await client.notification.findMany({
            where:{
                userId:userId
            }
        })
        res.status(HttpsCode.SUCESS).json({
            notifications:notifications
        })
    }
});


router.post("/notifications/:id/remove", [checkAuthenticated], async (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.id;

    try {
        let effected = UserHelper.burnNotification(userId,notificationId);
        if(!effected){
            throw new Error("Cannot remove notification")
        }
        res.status(HttpsCode.SUCESS).json({ message: "Notification removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(HttpsCode.SERVER_ERROR).json({ message: "Server error" });
    }
});





export default router;