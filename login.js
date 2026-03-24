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
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Fetch name from database
        const snap = await get(child(ref(database), 'users/' + user.uid));
        if (snap.exists() && snap.val().name) {
            localStorage.setItem('userName', snap.val().name);
        } else {
            localStorage.removeItem('userName');
        }
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
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorDiv = document.getElementById('registerError');
    errorDiv.style.display = 'none';
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Save name to database
        await set(ref(database, 'users/' + user.uid), { name });
        localStorage.setItem('userName', name);
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
