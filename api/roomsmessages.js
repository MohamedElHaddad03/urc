import { db } from "@vercel/postgres";
import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session.js";
import PushNotifications from "@pusher/push-notifications-server";

export default async function handler(request, response) {
    console.log("Using push instance : " + process.env.PUSHER_INSTANCE_ID);
    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });
    


    const client = await db.connect(); 


    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse(response); 
        }


        
        if (request.method === 'POST') {
            try {
                const message = await request.body;
                const { sender_id, room_id, content } = message;
        

        
                if (!sender_id || !room_id || !content) {
                    return response.status(400).json({ error: "Missing required fields" });
                }
        
                const numUser = Number(sender_id);
                const numRoom = Number(room_id);
        
                if (isNaN(numUser) || isNaN(numRoom)) {
                    return response.status(400).json({ error: "Room IDs must be valid numbers" });
                }
        
                const { rows: insertedMessageRows } = await client.sql`
                INSERT INTO roomsMessages (sender_id, room_id, content, sent_at) 
                VALUES (${numUser}, ${numRoom}, ${content}, now())
                RETURNING sender_id, room_id, content`;
              
              const newMessage = insertedMessageRows[0];  // Access the first row after insert
              console.log('------------------------------------');
              console.log("New message:", newMessage);
              console.log('------------------------------------');
              
              const { rows: userRows } = await client.sql`
                SELECT external_id FROM users;`;
              

              const { rows: roomRows } = await client.sql`
                SELECT * FROM rooms where room_id = ${room_id};`;
              const room = roomRows[0];


              

        
                
        
                try {
                    const publishResponse = await beamsClient.publishToUsers(userRows?.map(row => row.external_id), {
                        "interests":["hello"],
                        web: {
                            notification: {
                                title: room.name,
                                body: content,
                                ico: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                                "deep_link": `http://localhost:3000/conversation/room/${numRoom}`,
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

        else if (request.method === 'GET') {
            const { id } = request.query;

            if (!id) {
                return response.status(400).json({ error: "Room ID is required" });
            }


            const { rows: roomMessages } = await sql`
                SELECT sender_id,room_id,content,sent_at FROM roomsMessages 
                WHERE room_id  = ${id};
            `;
            
            
            return response.status(200).json(roomMessages);
        }

        return response.status(405).json({ error: "Method Not Allowed" });

    } catch (error) {
        console.error("Error handling request:", error);
        return response.status(500).json({ error: "Internal server error" });
    } 
}
