import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEjbKjo7bLbXsLm2FFS3nb5TjXNXMg2lc",
    authDomain: "mhig-edde5.firebaseapp.com",
    projectId: "mhig-edde5",
    storageBucket: "mhig-edde5.appspot.com",
    messagingSenderId: "855050639590",
    appId: "1:855050639590:web:84c985fb7c8e066681c327"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Switch between login/register
const loginContainer = document.querySelector('.login-container');
const registerContainer = document.getElementById('registerContainer');
document.getElementById('showRegister').onclick = () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = '';
};
document.getElementById('showLogin').onclick = () => {
    loginContainer.style.display = '';
    registerContainer.style.display = 'none';
};

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
    try {
        // Find user by username in database
        const usersSnap = await get(child(ref(database), 'users'));
        let foundUser = null;
        let foundUid = null;
        if (usersSnap.exists()) {
            const users = usersSnap.val();
            for (const [uid, userObj] of Object.entries(users)) {
                if (userObj.username && userObj.username.toLowerCase() === username.toLowerCase()) {
                    foundUser = userObj;
                    foundUid = uid;
                    break;
                }
            }
        }
        if (!foundUser) throw new Error('Username not found.');
        // Now sign in with email/password using foundUid as email (simulate email as username@fake.com)
        const fakeEmail = `${username}@fake.com`;
        const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
        const user = userCredential.user;
        localStorage.setItem('userName', username);
        window.location.href = 'posts.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = '';
    }
});

// Register
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorDiv = document.getElementById('registerError');
    errorDiv.style.display = 'none';
    try {
        // Check if username already exists
        const usersSnap = await get(child(ref(database), 'users'));
        if (usersSnap.exists()) {
            const users = usersSnap.val();
            for (const userObj of Object.values(users)) {
                if (userObj.username && userObj.username.toLowerCase() === username.toLowerCase()) {
                    throw new Error('Username already taken.');
                }
            }
        }
        // Use username as fake email for Firebase Auth
        const fakeEmail = `${username}@fake.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        const user = userCredential.user;
        // Save username to database
        await set(ref(database, 'users/' + user.uid), { username });
        localStorage.setItem('userName', username);
        window.location.href = 'posts.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = '';
    }
});

// Optional: Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'posts.html';
    }
});
