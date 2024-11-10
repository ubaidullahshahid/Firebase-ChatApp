import React, { useEffect, useState } from "react";
import Profile from "../../assets/avatar.svg";
import Input from "../../Components/input/input";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../../Config/firebase";
import Loader from "../../Components/loader/Loader";
import { CiMenuKebab } from "react-icons/ci";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currUser } = useSelector((state) => state.currentUser);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value !== " ") {
      setMessage(value);
    }
  };
  const sendMessage = async () => {
    if (editMessageId) {
      await updateDoc(doc(db, "messages", editMessageId), {
        message,
        editedAt: serverTimestamp(),
      });
      setEditMessageId(null);
    } else {
      await addDoc(collection(db, "messages"), {
        message,
        sentBy: currUser.uid,
        sentAt: serverTimestamp(),
      });
    }
    setMessage("");
  };

  const handleEditMessage = (message) => {
    setMessage(message.message);
    setEditMessageId(message.id);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(
        querySnapshot.docs
          .filter((doc) => doc.data().uid !== currUser.uid)
          .map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setLoading(false);
    };

    const fetchMessages = () => {
      const q = query(collection(db, "messages"), orderBy("sentAt", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setAllMessages(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      });
      return unsubscribe;
    };

    fetchUsers();
    const unsubscribeMessages = fetchMessages();

    return () => {
      unsubscribeMessages();
    };
  }, [currUser.uid]);

  const toggleMenu = (messageId) => {
    setIsMenuOpen((prev) => ({
      [messageId]: prev[messageId] ? false : true,
    }));
  };

  const deleteMessage = async (messageId) => {
    await updateDoc(doc(db, "messages", messageId), {
      message: "this message is deleted",
      deletedAt: serverTimestamp(),
    });
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-screen flex ">
          <div className="w-[25%] h-screen bg-secondary">
            <div className="flex items-center pl-4 gap-x-2 py-4 border-b">
              <div className="border border-primary p-[2px] rounded-full">
                <img src={Profile} width={50} height={50} alt="" />
              </div>
              <div>
                <p className="text-lg font-light">Hello</p>
              </div>
            </div>
            <div className="overflow-y-scroll no-scrollbar h-[84.5%]">
              <div className="text-primary text-lg pl-4">All Users</div>
              <div>
                {users &&
                  users.length > 0 &&
                  users.map((user) => (
                    <div key={user.userName} className="">
                      <div className="flex items-center py-4 border-b border-b-gray-300">
                        <div className="cursor-pointer flex items-center pl-4">
                          <div className="">
                            <img src={Profile} width={50} height={50} alt="" />
                          </div>
                          <div className="ml-6 ">
                            <h3 className="text-lg font-semibold">
                              {user.userName}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-[75%] h-screen bg-white flex flex-col items-center">
            <div className="w-[100%] bg-secondary py-2 flex items-center px-14">
              <div className="cursor-pointer">
                <img src={Profile} alt="" width={35} height={35} />
              </div>
              <div className="ml-6 mr-auto">
                <h3 className="text-sm font-semibold ">Alexander</h3>
                <p className="text-sm font-light text-gray-600">online</p>
              </div>
              <div className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-phone-outgoing"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                  <path d="M15 9l5 -5" />
                  <path d="M16 4l4 0l0 4" />
                </svg>
              </div>
            </div>
            <div className="h-[75%] w-full overflow-y-auto no-scrollbar shadow-sm ">
              <div className="h-auto p-14 ">
                {allMessages.length > 0 &&
                  allMessages.map((message) => (
                    <div
                      className={`max-w-[90%] relative w-[max-content] rounded-b-lg rounded-tr-lg p-4 mb-8 ${
                        message.sentBy === currUser.uid
                          ? "ml-auto bg-primary"
                          : "bg-secondary"
                      }`}
                      key={message.id}
                    >
                      <p>{message.message}</p>
                      {message.message !== "this message is deleted" && (
                        <>
                          <span
                            className="absolute top-1 left-0"
                            onClick={() => toggleMenu(message.id)}
                          >
                            <CiMenuKebab />
                          </span>
                          <div
                            className={`bg-black ${
                              isMenuOpen[message.id]
                                ? "flex flex-col"
                                : "hidden"
                            } cursor-pointer rounded-lg text-white p-2 absolute z-10 top-[-52px] left-[-50px]`}
                          >
                            <p
                              onClick={() => {
                                handleEditMessage(message);
                                toggleMenu(message.id);
                              }}
                            >
                              Edit
                            </p>
                            <p
                              onClick={() => {
                                deleteMessage(message.id);
                                toggleMenu(message.id);
                              }}
                            >
                              Delete
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-2 w-full flex items-center gap-x-2">
              <div className="w-[80%]">
                <Input
                  label=""
                  name="message"
                  type="text"
                  placeholder="Type Message..."
                  className="w-full"
                  value={message}
                  onChange={handleInputChange}
                  isRequired={true}
                />
              </div>
              <div
                className="p-4 cursor-pointer bg-secondary rounded-full"
                onClick={sendMessage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-send"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 14l11 -11" />
                  <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
              </div>
              <div className="p-4 cursor-pointer bg-secondary rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 5l0 14" />
                  <path d="M5 12l14 0" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
