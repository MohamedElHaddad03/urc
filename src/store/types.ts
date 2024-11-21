export default interface User {
    user_id: string;
    username: string;
    last_login: string;
  }
  
  export interface UsersState {
    data: User[];
    status: string;
    error: string | null;
  }
  
  export interface RootState {
    users: UsersState;
    messages : MessagesState;
    rooms : RoomsState;
    roomMessages : MessageRoomsState;

  }


  export interface Message{
    user_id1 : string;
    user_id2 : string;
    content : string;
    sent_at? : string;
  }
  export interface Room{
    room_id : string;
    name : string;
    created_by : string;
    created_at? : string;
  }
  export interface RoomsState {
    data: Room[];
    status: string;
    error: string | null;
  }
  export interface MessageRoom{
    sender_id : string;
    room_id : string;
    content : string;
    sent_at? : string;
  }

  export interface MessageRoomsState {
    data: MessageRoom[];
    status: string;
    error: string | null;
  }

  export interface MessageList{
    sentMessages :Message[],
    receivedMessages :Message[]
  }

  export interface MessagesState {
    data: MessageList;
    status: string;
    error: string | null;
  }
  

  
  