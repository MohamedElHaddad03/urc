import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../store/store";
import { useSelector } from "react-redux";
import { RootState } from "../store/types";
import { fetchRoomMessages } from "../store/messagesRoomsSlice";
import { sendRoomMessage } from "./roomsMessageApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { format } from "date-fns";
import { PutBlobResult } from "@vercel/blob";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

interface Params {
  id: string;
}

const ChatRoom: React.FC = () => {
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<Session>({} as Session);
  const [openError, setOpenError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notif, setNotif] = useState<any>();
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const messages = useSelector((state: RootState) => state.roomMessages.data);
  const error = useSelector((state: RootState) => state.roomMessages.error);

  const { id } = useParams<Params>();

  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (sw) {
      const handleMessage = (event: MessageEvent) => {
        setNotif(event.data);
      };
      sw.addEventListener("message", handleMessage);
      return () => {
        sw.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchRoomMessages(id));
    }
  }, [dispatch, notif, id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      console.log("Selected file:", selectedFile);

      if (selectedFile && selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);

        try {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const response = await fetch(`/api/upload?filename=${selectedFile.name}`, {
            method: "POST",
            body: selectedFile,
          });

          if (response.ok) {
            const newBlob = await response.json();
            console.log("Blob response:", newBlob);
            setBlob(newBlob);
            setMessage(newBlob?.downloadUrl);  
          } else {
            alert("Error uploading file. Please try again.");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Error uploading file. Please try again.");
        }
      } else {
        alert("Please select a valid image file (e.g., .jpg, .png, .gif).");
        setFile(null);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const messageContent = message;

    sendRoomMessage(
      {
        sender_id: sessionStorage.getItem("id") || "",
        room_id: id,
        content: messageContent,
      },
      (result: Session) => {
        setSession(result);
        setMessage("");  
        setFile(null);    
        setLoading(false);
      },
      (sendingError: CustomError) => {
        setLoading(false);
        setOpenError(true);
      }
    );
  };

  const sortedMessages = [
    ...(messages || []),
  ].sort((a, b) => {
    const dateA = a.sent_at ? new Date(a.sent_at).getTime() : 0;
    const dateB = b.sent_at ? new Date(b.sent_at).getTime() : 0;
    return dateA - dateB;
  });

  // Auto-scroll to the latest message
  useEffect(() => {
    const scrollDiv = document.getElementById("message-container");
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }, [sortedMessages]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f7fc",
        fontFamily: "Arial, sans-serif",
        width: "100%",
      }}
    >
      <Typography sx={{ marginTop: "10px" }} variant="h4" gutterBottom>
        Chat Room
      </Typography>

      <Box
        id="message-container"
        sx={{
          width: "90%",
          //maxWidth: 400,
          mt: 2,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 150px)",
          overflowY: "auto",
          paddingBottom: "100px",
          paddingRight: "10px",
        }}
      >
        {sortedMessages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf:
                msg.sender_id.toString() === sessionStorage.getItem("id")
                  ? "flex-end"
                  : "flex-start",
              backgroundColor:
                msg.sender_id.toString() === sessionStorage.getItem("id")
                  ? "#3f51b5"
                  : "#e0e0e0",
              color:
                msg.sender_id.toString() === sessionStorage.getItem("id")
                  ? "white"
                  : "black",
              padding: 2,
              borderRadius: 2,
              marginBottom: 1,
              maxWidth: "60%",
              wordWrap: "break-word",
            }}
          >
            {msg.content.startsWith("http") ? (
              <img
                src={msg.content}
                alt="Uploaded file"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                }}
                loading="lazy"
                onError={() => console.error("Image failed to load")}
              />
            ) : (
              <Typography variant="body1">{msg.content}</Typography>
            )}
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ textAlign: "right" }}
            >
              {msg.sent_at ? format(new Date(msg.sent_at), "dd/MM HH:mm") : ""}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Message input section */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "fixed",
          bottom: 0,
          width: "50%",
          padding: "10px 20px",
          backgroundColor: "#fff",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
          borderTop: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <TextField
          label="Type a message..."
          name="message"
          value={message}
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => setMessage(e.target.value)}
          sx={{ borderRadius: 50 }}
        />

        {/* File upload input */}
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            component="span"
            variant="contained"
            color="secondary"
            sx={{ height: "100%", paddingX: "20px", borderRadius: 50 }}
          >
            <FontAwesomeIcon icon={faCamera} />
          </Button>
        </label>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ height: "100%", paddingX: "20px", borderRadius: 50 }}
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Send"
          )}
        </Button>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={() => setOpenError(false)}
        message={error}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Box>
  );
};

export default ChatRoom;
