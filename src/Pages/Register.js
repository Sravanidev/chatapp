import React, { useState } from "react";
import Add from '../Images/download.png';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth,storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate, Link } from "react-router-dom";


const Register =() => {
    const [err, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(e.target.value);
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const file = e.target[3].files[0];

        try{
            const res = await createUserWithEmailAndPassword(auth, email, password);

            //Create a unique image name
            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`);
      
            await uploadBytesResumable(storageRef, file).then(() => {
              getDownloadURL(storageRef).then(async (downloadURL) => {
                try {
                  //Update profile
                  await updateProfile(res.user, {
                    displayName,
                    photoURL: downloadURL,
                  });
                  //create user on firestore
                  await setDoc(doc(db, "users", res.user.uid), {
                    uid: res.user.uid,
                    displayName,
                    email,
                    photoURL: downloadURL,
                  });
      
                  //create empty user chats on firestore
                  await setDoc(doc(db, "userChats", res.user.uid), {});
                  navigate("/");
                } catch (err) {
                  console.log(err);
                  setError(true);
                }
              });
            });
        
        }catch(err){
            setError(true);
        }  

    }

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Chat App</span>
                <span className="title">Register</span>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Name" />
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <input style={{display:"none"}} type="file" id="file" />
                    <label htmlFor="file" className="labelimage" >
                        <img src={Add} alt=""/>
                        <span>Add an Avatar</span>
                    </label>
                    <button>Sign Up</button>
                    {err && <span>Something went wrong</span>}
                </form>
                <p>You do have an account? <Link to="/login" >Login</Link> </p>
            </div>           
        </div>
    )
}

export default Register;