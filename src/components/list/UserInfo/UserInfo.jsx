import React from 'react'
import "./userInfo.css"
import { useSelector } from 'react-redux';

const UserInfo = () => {
  const {curruser} = useSelector((state) => state.fetch);

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={curruser.avatar||"./avatar.png"} alt="" />
        <h3>{curruser.username}</h3>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  )
}

export default UserInfo