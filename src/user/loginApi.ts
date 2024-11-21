import { Session, SessionCallback, ErrorCallback, User } from "../model/common";
import { CustomError } from "../model/CustomError";

export function loginUser(
  user: User,
  onResult: SessionCallback,
  onError: ErrorCallback
) {
  fetch("/api/login", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then(async (response) => {
    if (response.ok) {
      const session = (await response.json()) as Session;
      sessionStorage.setItem("id", session.id?.toString() || "");

      sessionStorage.setItem("token", session.token);
      sessionStorage.setItem("externalId", session.externalId);
      sessionStorage.setItem("username", session.username || "");
      onResult(session);
    } else {
      const error = (await response.json()) as CustomError;
      onError(error);
    }
  }, onError);
 
}

export function logOut( onError: ErrorCallback) {
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("externalId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
  } catch (error) {
    const customError: CustomError = {
      name: "Logout Error",
      code: "LOGOUT_ERROR",
      message: "An error occurred while logging out. Please try again.",
    };
    onError(customError);
  }
}
