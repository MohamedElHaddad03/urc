import { db } from '@vercel/postgres';
import { Redis } from '@upstash/redis';
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64";

export const config = {
    runtime: 'edge',
};

const redis = Redis.fromEnv();

export default async function handler(request) {
    try {
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
                status: 405,
                headers: { 'content-type': 'application/json' },
            });
        }

        const { email, username, password } = await request.json();

        if (!email || !username || !password) {
            const error = { code: "BAD_REQUEST", message: "Email, username, and password are required" };
            return new Response(JSON.stringify(error), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            });
        }

        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        const client = await db.connect();

        const { rowCount: usernameCount } = await client.sql`SELECT 1 FROM users WHERE username = ${username}`;
        if (usernameCount > 0) {
            const error = { code: "CONFLICT", message: "Username is already taken" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        const { rowCount: emailCount } = await client.sql`SELECT 1 FROM users WHERE email = ${email}`;
        if (emailCount > 0) {
            const error = { code: "CONFLICT", message: "Email is already in use" };
            return new Response(JSON.stringify(error), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            });
        }

        const { rows } = await client.sql`
            INSERT INTO users (email, username, password, created_on,external_id) 
            VALUES (${email}, ${username}, ${hashed64}, now(),${crypto.randomUUID().toString()}) 
            RETURNING user_id, username, email
        `;

        const newUser = rows[0];

        const token = crypto.randomUUID().toString();

        await redis.set(token, newUser, { ex: 3600 });

        const userInfo = {};
        userInfo[newUser.user_id] = newUser;
        await redis.hset("users", userInfo);

        return new Response(JSON.stringify({
            token: token,
            username: newUser.username,
            email: newUser.email,
            id: newUser.user_id,
        }), {
            status: 201, 
            headers: { 'content-type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }
}
