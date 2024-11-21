import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useAppDispatch } from "../store/store";
import { useSelector } from "react-redux";
import { RootState } from "../store/types";
import { fetchRoomMessages } from "../store/messagesRoomsSlice";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import type { PutBlobResult } from '@vercel/blob';

import { format } from "date-fns";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { sendRoomMessage } from "./roomsMessageApi";


interface Params {
  id: string;
}

const ChatRoom: React.FC = () => {
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<Session>({} as Session);
  const [openError, setOpenError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null); // New state to hold the selected file
  const [notif, setNotif] = useState();
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const messages = useSelector((state: RootState) => state.roomMessages.data);
  const status = useSelector((state: RootState) => state.roomMessages.status);
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
  }, [dispatch, notif]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      console.log("Selected file:", selectedFile);  
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          
          console.log("Form data:", formData);
          
          const response = await fetch(`/api/upload?filename=${selectedFile.name}`, {
            method: 'POST',
            body: selectedFile,
          });
  
          console.log("Response status:", response.status);  
          if (response.ok) {
            const newBlob = await response.json();
            console.log("Blob response:", newBlob);  
            setBlob(newBlob);
            setMessage(newBlob?.downloadUrl)
          } else {
            console.error("Failed to upload file:", response.statusText);
            alert("Error uploading file. Please try again.");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Error uploading file. Please try again.");
        }
      } else {
        console.warn("Invalid file type selected:", selectedFile.type);  // Debug: Log invalid file type
        alert("Please select an image file (e.g., .jpg, .png, .gif).");
        setFile(null);
      }
    } else {
      console.warn("No file selected");  
    }
  };
  
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);


    let messageContent = "";
     messageContent = message;



    sendRoomMessage(
      {
        sender_id: sessionStorage.getItem("id") || "",
        room_id: id,
        content: messageContent,
      },
      (result: Session) => {
        setSession(result);
        setMessage("");
        setFile(null); // Reset the file after sending
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

  useEffect(() => {
    const scrollDiv = document.getElementById("message-container");
    if (scrollDiv) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }
  }, [sortedMessages]);

  return (
    <div>
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
          maxWidth: { xs: "100%", md: "70%" },
          margin: "0 auto",
        }}
      >
        <Typography sx={{ marginTop: "10px" }} variant="h4" gutterBottom>
          Chat
        </Typography>

        <Box
          id="message-container"
          sx={{
            width: "100%",
            maxWidth: 400,
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
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                onError={() => console.error('Image failed to load')}
                  loading="lazy"
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

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "fixed",
            bottom: 0,
            maxWidth: "60%",
            padding: "10px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
            borderTop: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            gap: 10,
            zIndex: 10,
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
              Attach File
            </Button>
          </label>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ height: "100%", paddingX: "20px", borderRadius: 50 }}
            disabled={loading || (!message.trim() )}
            >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Send"
            )}
          </Button>
        </Box>

        <Snackbar
          open={openError}
          autoHideDuration={6000}
          onClose={() => setOpenError(false)}
          message={error}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </Box>
    </div>
  );
};

export default ChatRoom;