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
        <p>C h a t A l l s</p>
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
      <img alt="Logo de bienvenida" className='logoImg' src={logo}></img>
      <button className='signInBtn' onClick={signInWithGoogle}>Sign in with Google</button>;
    </>
  )
}

function SignOut() {
  return (
    auth.currentUser && <button className='SignOutBtn' onClick={() => auth.signOut()}><i className="fa fa-power-off"></i></button>
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

    if (formValue !== ''){
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
      setFormValue('');
    }
    
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
          placeholder="Di Hola a todo el mundo!"
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
      <img alt="Imagen de perfil del usuario" src={photoURL} />
      <p>{text}</p>
    </div>
  );
  
}

export default App;
