import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import logo from './undraw.svg'

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAlEtEb453W98ezKhWB0pTeMjmoP8WYWRk",
  authDomain: "chatalls.firebaseapp.com",
  databaseURL: "https://chatalls.firebaseio.com",
  projectId: "chatalls",
  storageBucket: "chatalls.appspot.com",
  messagingSenderId: "606166210461",
  appId: "1:606166210461:web:3420453b22b52fdae60174",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <p>ChatAlls | ElvisGmz_</p>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <img className='logoImg' src={logo}></img>
      <center>
      <p>Inicia sesion con tu cuenta de Google para poder charlar en grupo.</p>
      </center>
      <button className='signInBtn' onClick={signInWithGoogle}>Sign in with Google</button>;
    </>
  )
}

function SignOut() {
  return (
    auth.currentUser && <button className='SignOutBtn' onClick={() => auth.signOut()}><i class="fa fa-power-off"></i></button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(50)

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  
  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue('');
    
  };

  useEffect(()=>{
    dummy.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
  })

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          placeholder="Say Hello!"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button className='sendBtn' type="submit"><i className='fas fa-paper-plane'></i></button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
  
}

export default App;
