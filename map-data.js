import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEjbKjo7bLbXsLm2FFS3nb5TjXNXMg2lc",
    authDomain: "mhig-edde5.firebaseapp.com",
    projectId: "mhig-edde5",
    storageBucket: "mhig-edde5.appspot.com",
    messagingSenderId: "855050639590",
    appId: "1:855050639590:web:84c985fb7c8e066681c327"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export async function getEntriesByState(stateName) {
    if (!stateName) return [];
    try {
        const snapshot = await get(child(ref(database), 'directory'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        const entries = Object.keys(data).map(title => ({
            title,
            gradeLevels: data[title].gradeLevels || '',
            tags: data[title].tags || '',
            state: data[title].state || '',
            pictures: data[title].pictures || [],
            links: data[title].links || [],
            helpfulInfo: data[title].helpfulInfo || ''
        }));
        const normalized = stateName.trim().toLowerCase();
        return entries.filter(e => (e.state || '').trim().toLowerCase() === normalized);
    } catch (err) {
        console.error('map-data getEntriesByState error', err);
        return [];
    }
}
