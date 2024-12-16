import React, { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'

const Login = () => {
    const [avatar, setavatar] = useState({
        file: null,
        url: "",
    })
    const [loading, setloading] = useState(false)

    const handleAvatar = e => {
        if (e.target.files[0]) {
            setavatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    
    const handleLogin = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            toast.success("Login Successfully")
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
        finally {
            setloading(false)
        }

    }

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);
        setloading(true);
    
        try {
            let imgUrl = ""; 
            
            if (avatar.file && avatar.file.size > 0) {
                imgUrl = await upload(avatar.file); 
            } else {
                imgUrl = "./avatar.png"; 
            }
            
            const res = await createUserWithEmailAndPassword(auth, email, password);
    
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl, 
                id: res.user.uid,
                blocked: [],
            });
    
            await setDoc(doc(db, "userchat", res.user.uid), {
                chats: [],
            });
    
            toast.success("Account created! You can login now");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setloading(false); 
        }
   
    }

    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin} action="">
                    <input type="text" placeholder='Enter your registered Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading}>{loading ? "Loading" : "Login"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account,</h2>
                <form onSubmit={handleRegister} action="">
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload Profile Photo
                    </label>
                    <input style={{ display: "none" }} type="file" id='file' onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name='username' />
                    <input type="text" placeholder='Enter your Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login