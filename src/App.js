import { Link, Route, BrowserRouter as Router, Switch } from "react-router-dom";
import "./App.css";
import { Login } from "./user/Login";
import { Signup } from "./user/signup";
import { logOut } from "./user/loginApi";
import { useEffect, useState } from "react";
import UsersList from "./messagerie/ListUsers";
import { store } from "./store/store";
import { Provider } from "react-redux";
import MessagesPage from "./messagerie/MessagePage";
import MessageList from "./messagerie/messageList";
import RoomsList from "./messagerie/ListRooms";
import ChatRoom from "./messagerie/ChatRoom";
import AvatarUploadPage from "./messagerie/upload";

function App() {
  const [username, setUsername] = useState(sessionStorage.getItem("username"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(sessionStorage.getItem("username"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [username]);

  const handleLogout = () => {
    logOut(
      () => {
        console.log("Logged out successfully!");
        window.location.href = "/";
      },
      (error) => {
        console.error("Logout error:", error.message);
        alert("There was an issue logging out. Please try again.");
      }
    );
  };

  return (
    <>
      <Provider store={store}>
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return sessionStorage.getItem("username") ? (
                <>
                  <h2>Welcome {sessionStorage.getItem("username")}</h2>
                  <Link to="/signup">Go to Signup</Link>
                  <button onClick={handleLogout}>LogOut</button>
                </>
              ) : (
                <Login />
              );
            }}
          />
          <Route path="/listUser" component={UsersList} />
          <Route
          path="/conversation/user/:id"
          component={(props) => <MessageList {...props} type="user" />}
        />

        <Route
          path="/conversation/room/:id"
          component={(props) => <MessageList {...props} type="room" />}
        />

           <Route path="/signup" component={Signup} />
           <Route path="/login" component={Login} />
           <Route path="/avatar" component={AvatarUploadPage} />


           
        </Switch>
      </Router>
      </Provider>
    </>
  );
}

export default App;
