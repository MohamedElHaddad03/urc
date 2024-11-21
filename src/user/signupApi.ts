import { Session, SessionCallback, ErrorCallback, User } from "../model/common";
import { CustomError } from "../model/CustomError";

export function signupUser(user: User, onResult: SessionCallback, onError: ErrorCallback) {
    fetch("/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })
    .then(async (response) => {
        if (response.ok) {
            const session = await response.json() as Session;

            sessionStorage.setItem('token', session.token);
            sessionStorage.setItem('externalId', session.externalId);
            sessionStorage.setItem('username', session.username || "");
            if (session.id) {
                sessionStorage.setItem('userId', session.id.toString());
            } else {
                console.error('User ID is missing in the session response');
            }
            onResult(session);
        } else {
            const error = await response.json() as CustomError;
            onError(error);
        }
    })
    .catch((error) => {
        const customError: CustomError = {
            message: "An unexpected error occurred. Please try again later.",
            code: "NETWORK_ERROR",
            name :""
        };
        onError(customError);
    });
}
