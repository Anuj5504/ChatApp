import React, { useState } from 'react';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { curruser } = useSelector((state) => state.fetch);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.log("Hi",error.message);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchat");
    try {
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      })
      console.log(user.id,curruser.id)

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion(
          {
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: curruser.id,
            updatedAt: Date.now(),
          }
        )
      })

      await updateDoc(doc(userChatsRef, curruser.id), {
        chats: arrayUnion(
          {
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: user.id,
            updatedAt: Date.now(),
          }
        )
      })
    } catch (error) {
      console.log("Hii",error.message)
    }
  }

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;