import React, { useEffect, useState } from 'react';
import './details.css';
import { auth, db } from '../../lib/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { toggleBlock } from '../../lib/state/chat/chat';

const Details = () => {
  const dispatch = useDispatch();
  const { chatId, user, isCurrentUserBlocked, isRecieverUserBlocked } = useSelector((state) => state.chat);
  const { curruser } = useSelector((state) => state.fetch);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [close, setclose] = useState(true)

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", curruser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isRecieverUserBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      dispatch(toggleBlock());
    } catch (error) {
      console.error("Failed to update block status:", error.message);
    }
  };

  async function getImagesFromMessages(chatId) {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const messages = chatDoc.data().messages;
        const imageUrls = messages
          .filter(message => message.img)
          .map(message => ({ url: message.img, date: message.createdAt }));

        return imageUrls;
      } else {
        console.log("Document exists but could not be fetched.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const images = await getImagesFromMessages(chatId);
      setImages(images);
      setLoading(false);
    }

    fetchImages();
  }, [chatId]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'photo.jpg';
    link.click();
  };

  return (
    <div className='details'>
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="User avatar" />
        <h2>{user?.username || "Username"}</h2>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Toggle icon" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Toggle icon" />
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={()=>setclose(!close)}>
            <span>Shared Photos</span>
            {close?<img src="./arrowUp.png" alt="Toggle icon" />:<img src="./arrowDown.png" alt="Toggle icon" />}
          </div>
          {loading ? (
            <p>Loading photos...</p>
          ) : (
            !close && <div className="photos">
              {images.map((image, index) => (
                <div className="photoItem" key={index} onClick={() => handleImageClick(image.url)}>
                  <div className="photoDetail">
                    <img src={image.url} alt={`Photo ${index + 1}`} loading="lazy" />
                  </div>
                  <img
                    className='icon'
                    src="./download.png"
                    alt="Download icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image.url);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Toggle icon" />
          </div>
        </div>

        <button onClick={handleBlock}>
          {isCurrentUserBlocked ? "You are Blocked" : isRecieverUserBlocked ? "User Blocked" : "Block User"}
        </button>

        <button className='logout' onClick={() => auth.signOut()}>Logout</button>
      </div>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Enlarged view" />
        </div>
      )}
    </div>
  );
};

export default Details;
