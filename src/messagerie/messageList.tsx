import { useParams } from 'react-router-dom';
import MessagesPage from './MessagePage';
import UsersList from './ListUsers';
import RoomsList from './ListRooms';
import ChatRoom from './ChatRoom';

const MessageList = () => {
  // Récupérer l'ID de l'URL pour déterminer si c'est une conversation avec un utilisateur ou une salle
  const { id } = useParams<{ id: string }>();

  // Vérifier si l'ID est pour une conversation avec un utilisateur ou une salle
  const isUserConversation = window.location.pathname.startsWith('/conversation/user');
  const isRoomConversation = window.location.pathname.startsWith('/conversation/room');

  return (
    <div>
      <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        <div style={{ width: '30%', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
          <UsersList />
          <RoomsList />
        </div>

        <div style={{ width: '70%', padding: '16px', overflowY: 'auto' }}>
          {isUserConversation && <MessagesPage />}
          {isRoomConversation && <ChatRoom />}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
