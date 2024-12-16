import React, { useEffect, useState } from 'react';
import "./chatList.css";
import AddUser from './addUser/AddUser';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { changeChat } from '../../../lib/state/chat/chat';

const ChatList = () => {
  const [addMode, setaddMode] = useState(false);
  const { curruser } = useSelector((state) => state.fetch);
  const [chats, setchats] = useState([]);
  const [input, setinput] = useState("")
  const dispatch = useDispatch();

  useEffect(() => {
    if (curruser?.id) {
      const unsub = onSnapshot(doc(db, "userchat", curruser.id), async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setchats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => unsub();
    }
  }, [curruser?.id]);

  const handleSelect = async (chatId, user) => {

    const userChatsRef = doc(db, "userchat", curruser.id)
    const userChatSnapshot = await getDoc(userChatsRef)

    if (userChatSnapshot.exists()) {
      const userChats=chats.map(item=>{
        const {user,...rest}=item
        return rest
      })

      const chatIndex=userChats.findIndex(item=>item.chatId===chatId)
      userChats[chatIndex].isSeen=true

      const userChatsRef=doc(db,"userchat",curruser.id)
      
      try {
        await updateDoc(userChatsRef,{
          chats:userChats
        })
      } catch (error) {
        console.log(error.message)
      }


      dispatch(changeChat({ chatId, user, curruser }));
    }
  };

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));
  return (
      <div className='chatList'>
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="" />
            <input type="text" placeholder='Search' onChange={(e)=>setinput(e.target.value)}/>
          </div>
          <img className='add' src={addMode ? "./minus.png" : "./plus.png"} alt="" onClick={() => setaddMode(!addMode)} />
        </div>
        {filteredChats.map((chat) => (
          <div key={chat.chatId} className="item" onClick={() => handleSelect(chat.chatId, chat.user)} style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}>
            <img src={chat.user.avatar || "./avatar.png"} alt="User avatar" />
            <div className="texts">
              <span>{chat.user.username}</span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
        {addMode && <AddUser />}
      </div>
    );
  };

  export default ChatList;
