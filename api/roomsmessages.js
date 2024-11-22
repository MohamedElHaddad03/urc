import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";
import PushNotifications from "@pusher/push-notifications-server";

export default async function handler(request, response) {
    console.log("Using push instance : " + process.env.PUSHER_INSTANCE_ID);
    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });
    
    console.log('------------------------------------');
    console.log("Request Body:", request.body);
    console.log('------------------------------------');



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
        
                console.log('------------------------------------');
                console.log("Received message:", message);
                console.log('------------------------------------');
        
                if (!sender_id || !room_id || !content) {
                    return response.status(400).json({ error: "Missing required fields" });
                }
        
                const numUser = Number(sender_id);
                const numRoom = Number(room_id);
        
                if (isNaN(numUser) || isNaN(numRoom)) {
                    return response.status(400).json({ error: "Room IDs must be valid numbers" });
                }
        
                const { rows: insertedMessageRows } = await sql`
                INSERT INTO roomsMessages (sender_id, room_id, content, sent_at) 
                VALUES (${numUser}, ${numRoom}, ${content}, now())
                RETURNING sender_id, room_id, content`;
              
              const newMessage = insertedMessageRows[0];  // Access the first row after insert
              console.log('------------------------------------');
              console.log("New message:", newMessage);
              console.log('------------------------------------');
              
              const { rows: userRows } = await sql`
                SELECT external_id FROM users;`;
              
              console.log('------------------------------------');
              console.log("All user external_ids:", userRows);  
              console.log('------------------------------------');
              const { rows: roomRows } = await client.sql`
                SELECT * FROM rooms where room_id = ${room_id};`;
              const room = roomRows[0];

              console.log('------------------------------------');
              console.log("Current Room:", room);  
              console.log('------------------------------------');
              

        
                
        
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

            console.log('------------------------------------');
            console.log("Room ID:", id);
            console.log('------------------------------------');

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
