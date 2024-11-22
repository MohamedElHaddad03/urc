import { Session, SessionCallback, ErrorCallback } from "../model/common";
import { CustomError } from "../model/CustomError";
import {  MessageRoom } from "../store/types";

export function sendRoomMessage(message: MessageRoom, onResult: SessionCallback, onError: ErrorCallback) {
    console.log(JSON.stringify(message))
    const token = sessionStorage.getItem('token'); 

    fetch("/api/roomsmessages", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authentication': `Bearer ${token}`, 
          },
        body: JSON.stringify(message),
    })
    .then(async (response) => {
        if (response.ok) {
            try {
                const session: Session = await response.json();
                onResult(session);  
            } catch (error ) {
                const customError: CustomError = {
                    message: "Failed to parse response from the server.",
                    code: "PARSE_ERROR",
                    name:  "ParseError",
                };
                onError(customError);
            }
        } else {
            try {
                const errorData: CustomError = await response.json();
                onError(errorData);
            } catch (error) {
                const customError: CustomError = {
                    message: "Failed to parse error response from the server.",
                    code: "PARSE_ERROR",
                    name: "ParseError",
                };
                onError(customError);
            }
        }
    })
    .catch((error) => {
        const customError: CustomError = {
            message: "An unexpected error occurred. Please try again later.",
            code: "NETWORK_ERROR",
            name: error.name || "NetworkError",
        };
        onError(customError);
    });
}
