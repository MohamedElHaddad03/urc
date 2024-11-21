import { sql } from "@vercel/postgres";
import { checkSession, unauthorizedResponse } from "../lib/session";

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return new Response('Unauthorized', {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        const { rowCount, rows } = await sql`SELECT * FROM rooms ORDER BY created_on DESC`;
        console.log(`Got ${rowCount} rooms`);

        return new Response(
            rowCount === 0 ? '[]' : JSON.stringify(rows),
            {
                status: 200,
                headers: { 'content-type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
};
