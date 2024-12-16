import { onAuthStateChanged } from "firebase/auth";
import Chat from "./components/chat/Chat"
import Details from "./components/details/Details"
import List from "./components/list/List"
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { auth } from "./lib/firebase";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./lib/state/store";
import { fetchUser } from "./lib/state/fetch/fetchUser";


const App = () => {
  return (
    <Provider store={store}> 
      <AppContent />
    </Provider>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();
  const {curruser,loading} = useSelector((state) => state.fetch);
  const {chatId} = useSelector((state) => state.chat);
  // const user=false;

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(fetchUser(user.uid)); 
      } else {
        dispatch(fetchUser(null));  
      }
    });

    return () => {
      unSub();
    };
  }, [dispatch]);

  if(loading) return <div className="loading">Loading...</div>
  
  return (
      <div className='container'>
        {
          curruser ? (
            <>
              <List />
              {chatId && <Chat />}
              {chatId && <Details />}
            </>
          ) : (
            <Login />
          )
        }
        <Notification />
      </div>
  )
}

export default App