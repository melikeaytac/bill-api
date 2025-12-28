import { 
  db, 
} from "../firebase";
import { 
  query, 
  collection, 
  onSnapshot, 
  orderBy, 
  where, 
  serverTimestamp, 
  Timestamp, 
  doc, 
  getDocs,
  setDoc 
} from "firebase/firestore";

const chatRef = collection(db, "messages");

export async function addMessage(role, text, mode) {
  const newDoc = doc(chatRef);
  await setDoc(newDoc, {
    id: newDoc.id,
    role,
    text,
    mode,
    createdAt: serverTimestamp(),
  });
  console.log("Firestore add:", { id: newDoc.id, role, text, mode });
}

export async function fetchSystemMessages() {
  const q = query(collection(db, "messages"), where("mode", "==", "system"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export function subscribeMessages(callback) {
  const now = Timestamp.now();
  const tenMinutesAgo = Timestamp.fromMillis(now.toMillis() - 10 * 60 * 1000);
  const q = query(
    collection(db, "messages"),
    where("createdAt", ">", tenMinutesAgo),
    orderBy("createdAt")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const grouped = { query: [], detailed: [], pay: [] };

    const systemMessages = data.filter((m) => m.mode === "system");
    const normalMessages = data.filter((m) => m.mode !== "system");

    normalMessages.forEach((m) => {
      if (grouped[m.mode]) grouped[m.mode].push(m);
    });

    callback([...systemMessages, ...normalMessages]); 
  });
}

