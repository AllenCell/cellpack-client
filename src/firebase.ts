import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    where,
} from "firebase/firestore";


const firebaseConfig = {
    apiKey: import.meta.env.API_KEY,
    authDomain: "cell-pack-database.firebaseapp.com",
    projectId: "cell-pack-database",
    storageBucket: "cell-pack-database.firebasestorage.app",
    messagingSenderId: import.meta.env.MESSAGING_SENDER_ID,
    appId: import.meta.env.APP_ID,
    measurementId: import.meta.env.MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export  const queryFirebase = async (jobId: string) => {
        const q = query(
            collection(db, "results"),
            where("batch_job_id", "==", jobId)
        );
        const querySnapshot = await getDocs(q);
        let resultUrl = "";
        querySnapshot.forEach((doc) => {
            // we'll only ever expect one doc to show up here
            resultUrl = doc.data().url;
        });
        return resultUrl;
    };

export { db };

