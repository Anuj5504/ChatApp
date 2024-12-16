import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { db } from '../../lib/firebase';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import upload from '../../lib/upload';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate(); 
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
  const [open, setopen] = useState(false);
  const [chat, setchat] = useState();
  const { chatId, user, isCurrentUserBlocked, isRecieverUserBlocked } = useSelector((state) => state.chat);
  const { curruser } = useSelector((state) => state.fetch);
  const [img, setimage] = useState({
    file: null,
    url: "",
  });
  const [text, settext] = useState("");

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setchat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  console.log(chat);

  const handleEmoji = e => {
    settext((prev) => prev + e.emoji);
    setopen(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    const recipientSnapshot = await getDoc(doc(db, "users", user.id));
    const recipientData = recipientSnapshot.data();

    if (recipientData.blocked && recipientData.blocked.includes(curruser.id)) {
      return;
    }

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: curruser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIds = [curruser.id, user.id];

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchat", id);
        const userChatSnapshot = await getDoc(userChatsRef);

        if (userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          userChatsData.chats[chatIndex].isSeen = id === curruser.id ? true : false;

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }

    setimage({
      file: null,
      url: "",
    });

    settext("");
  };

  const handleImage = e => {
    if (e.target.files[0]) {
      setimage({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={message.senderId === curruser?.id ? "message own" : "message"} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} alt="Sent image" />}
              <p>{message.text}</p>
              <span>{formatTimestamp(message.createdAt)}</span>
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleImage} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isRecieverUserBlocked) ? 'You cannot send a message' : 'Type a Message...'}
          value={text}
          onChange={e => settext(e.target.value)}
          disabled={isCurrentUserBlocked || isRecieverUserBlocked}
        />

        <div className="emojis">
          <img src="./emoji.png" alt="" onClick={() => setopen(!open)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isRecieverUserBlocked}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
