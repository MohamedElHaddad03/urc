import { getConnecterUser } from "../lib/session.js";
import { db ,sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session.js";
import PushNotifications from "@pusher/push-notifications-server";
import dotenv from 'dotenv';  
dotenv.config();
export default async function handler(request, response) {
    console.log("Using push instance : " + process.env.PUSHER_INSTANCE_ID);
    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });

    
    const client = await db.connect(); 
    const user = await getConnecterUser(request);


    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse(response); // Changed to use response
        }


        if (request.method === 'POST') {
            try {
                const message = await request.body;
                const { user_id1, user_id2, content } = message;
        

        
                if (!user_id1 || !user_id2 || !content) {
                    return response.status(400).json({ error: "Missing required fields" });
                }
        
                const numUserId1 = Number(user_id1);
                const numUserId2 = Number(user_id2);
        
                if (isNaN(numUserId1) || isNaN(numUserId2)) {
                    return response.status(400).json({ error: "User IDs must be valid numbers" });
                }
        
                const { rows } = await client.sql`
                    INSERT INTO message (user_id1, user_id2, content, sent_at) 
                    VALUES (${numUserId1}, ${numUserId2}, ${content}, now())
                    RETURNING user_id1, content`;
                
                const newMessage = rows[0];

        
                const { rows: userRows } = await client.sql`
                    SELECT * FROM users WHERE user_id = ${numUserId2} LIMIT 1
                `;
        
                if (!userRows.length) {
                    return response.status(404).json({ error: "User not found" });
                }
        
                const user = userRows[0];

        
                try {
                    const publishResponse = await beamsClient.publishToUsers([user.external_id], {
                        "interests":["hello"],
                        web: {
                            notification: {
                                title: user.username,
                                body: content,
                                ico: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                                "deep_link": `http://localhost:3000/conversation/user/${numUserId2}`,
                            },
                        },
                    });
                } catch (error) {
                    console.error("Failed to send push notification:", error);
                    return response.status(500).json({ error: "Failed to send notification" });
                }
        
                return response.status(200).json({ message: "Message sent successfully" });
            } catch (error) {
                console.error("Error processing message:", error);
                return response.status(500).json({ error: "Internal server error" });
            }
        }
        

        // Handle GET method
        else if (request.method === 'GET') {
            const { id } = request.query;

            if (!id) {
                return response.status(400).json({ error: "User ID is required" });
            }



            const { rows: sentMessages } = await sql`
                SELECT * FROM message 
                WHERE user_id1 = ${user.id} AND user_id2 = ${id};
            `;
            
            const { rows: receivedMessages } = await sql`
                SELECT * FROM message 
                WHERE user_id1 = ${id} AND user_id2 = ${user.id};
            `;



            return response.status(200).json({
                sentMessages,
                receivedMessages
            });
        }

        return response.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        console.error("Error handling request:", error);
        return response.status(500).json({ error: "Internal server error" });
    } 
}
