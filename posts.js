import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, set, get, child, push, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Firebase config (same as directory.js)
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

const auth = getAuth(app);

// Hide post form and comment forms if not logged in
function requireAuthForPosting() {
    onAuthStateChanged(auth, (user) => {
        console.debug('[AuthStateChanged] user:', user);
        const postForm = document.getElementById('postForm');
        const signOutBtnContainer = document.getElementById('signOutBtnContainer');
        const loginPrompt = document.getElementById('loginPrompt');
        const loginDropdownBtn = document.getElementById('loginDropdownBtn');
        if (!user) {
            if (postForm) { postForm.style.display = 'none'; console.debug('Hiding postForm'); }
            if (signOutBtnContainer) { signOutBtnContainer.style.display = 'none'; console.debug('Hiding signOutBtnContainer'); }
            if (loginDropdownBtn) { loginDropdownBtn.style.display = ''; console.debug('Showing loginDropdownBtn'); }
            if (loginPrompt) { loginPrompt.style.display = ''; console.debug('Showing loginPrompt'); }
            document.querySelectorAll('.comment-form').forEach(f => { f.style.display = 'none'; });
        } else {
            if (postForm) { postForm.style.display = ''; console.debug('Showing postForm'); }
            if (signOutBtnContainer) { signOutBtnContainer.style.display = ''; console.debug('Showing signOutBtnContainer'); }
            if (loginDropdownBtn) { loginDropdownBtn.style.display = 'none'; console.debug('Hiding loginDropdownBtn'); }
            if (loginPrompt) { loginPrompt.style.display = 'none'; console.debug('Hiding loginPrompt'); }
            document.querySelectorAll('.comment-form').forEach(f => { f.style.display = ''; });
        }
    });
}
const preloadedTags = [
    "Mathematics",
    "ComputerScience",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "DataScience",
    "Statistics",
    "Economics",
    "EnvironmentalScience",
    "Psychology",
    "Neuroscience",
    "BiomedicalScience",
    "InformationTechnology",
    "ArtificialIntelligence",
    "Agriculture"
];


let selectedTags = [];

function initializeTagsInput() {
    const tagsInput = document.getElementById('tagsInput');
    const tagsAutocomplete = document.getElementById('tagsAutocomplete');
    let selectedOptionIndex = -1;
    if (!tagsInput) return;
    tagsInput.addEventListener('input', function(e) {
        const value = e.target.value;
        selectedOptionIndex = -1;
        if (value.includes('#')) {
            const parts = value.split('#');
            const lastPart = parts[parts.length - 1].trim();
            if (lastPart.length > 0) {
                showTagAutocomplete(lastPart, tagsAutocomplete);
            } else {
                tagsAutocomplete.innerHTML = '';
            }
        } else {
            tagsAutocomplete.innerHTML = '';
        }
    });
    tagsInput.addEventListener('keydown', function(e) {
        const options = tagsAutocomplete.querySelectorAll('.tag-autocomplete-option');
        const hasOptions = options.length > 0;
        if (e.key === 'ArrowDown' && hasOptions) {
            e.preventDefault();
            selectedOptionIndex = Math.min(selectedOptionIndex + 1, options.length - 1);
            updateSelectedOption(options, selectedOptionIndex);
        } else if (e.key === 'ArrowUp' && hasOptions) {
            e.preventDefault();
            selectedOptionIndex = Math.max(selectedOptionIndex - 1, -1);
            updateSelectedOption(options, selectedOptionIndex);
        } else if (e.code === 'Space' && e.target.value.includes('#')) {
            if (selectedOptionIndex === -1) {
                e.preventDefault();
                handleTagInput(tagsInput);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedOptionIndex >= 0 && hasOptions) {
                options[selectedOptionIndex].click();
                selectedOptionIndex = -1;
            } else if (e.target.value.includes('#')) {
                handleTagInput(tagsInput);
            }
        } else if (e.key === 'Backspace' && e.target.value === '' && selectedTags.length > 0) {
            e.preventDefault();
            selectedTags.pop();
            updateTagsDisplay();
        }
    });
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tags-input-container')) {
            tagsAutocomplete.innerHTML = '';
            selectedOptionIndex = -1;
        }
    });
}

function updateSelectedOption(options, index) {
    options.forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('tag-option-selected');
        } else {
            opt.classList.remove('tag-option-selected');
        }
    });
    if (index >= 0) {
        options[index].scrollIntoView({ block: 'nearest' });
    }
}

function showTagAutocomplete(input, container) {
    const filtered = preloadedTags.filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase())
    );
    container.innerHTML = '';
    if (filtered.length === 0) return;
    const tagsInput = document.getElementById('tagsInput');
    const rect = tagsInput.getBoundingClientRect();
    container.style.top = (rect.bottom + 4) + 'px';
    container.style.left = rect.left + 'px';
    container.style.width = (rect.width - 24) + 'px';
    filtered.forEach(tag => {
        const option = document.createElement('div');
        option.className = 'tag-autocomplete-option';
        option.textContent = tag;
        option.addEventListener('click', function() {
            addTag(tag);
            document.getElementById('tagsInput').value = '';
            container.innerHTML = '';
        });
        container.appendChild(option);
    });
}

function handleTagInput(input) {
    const value = input.value.trim();
    if (!value.includes('#')) return;
    let tagName = value.substring(value.lastIndexOf('#') + 1).trim();
    if (tagName.length === 0) return;
    tagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    if (selectedTags.includes(tagName)) {
        alert('This tag is already selected');
        input.value = '';
        return;
    }
    if (selectedTags.length >= 15) {
        alert('Maximum 15 tags allowed');
        input.value = '';
        return;
    }
    addTag(tagName);
    input.value = '';
    document.getElementById('tagsAutocomplete').innerHTML = '';
}

function addTag(tag) {
    if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
        updateTagsDisplay();
    }
}

function removeTag(index) {
    selectedTags.splice(index, 1);
    updateTagsDisplay();
}

function updateTagsDisplay() {
    const display = document.getElementById('tagsDisplay');
    const tagsInput = document.getElementById('tagsInput');
    const hiddenInput = document.getElementById('tagsValue');
    if (!display || !hiddenInput) return;
    display.innerHTML = '';
    selectedTags.forEach((tag, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'tag-bubble';
        const text = document.createElement('span');
        text.textContent = '#' + tag;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tag-bubble-close';
        closeBtn.textContent = '×';
        closeBtn.type = 'button';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeTag(index);
        });
        bubble.appendChild(text);
        bubble.appendChild(closeBtn);
        display.appendChild(bubble);
    });
    if (tagsInput) {
        if (selectedTags.length > 0) {
            tagsInput.placeholder = '';
        } else {
            tagsInput.placeholder = 'type #niche about your extracurricular (hit space to add more)';
        }
    }
    hiddenInput.value = selectedTags.length > 0 ? JSON.stringify(selectedTags) : '';
}

const signOutBtn = document.getElementById('signOutBtn');
if (signOutBtn) {
    signOutBtn.onclick = async () => {
        await signOut(auth);
        localStorage.clear();
        window.location.href = 'login.html';
    };
}

// --- Ensure posts load and tag input works on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tag input for post form
    initializeTagsInput();
    // Attach sign out handler if present
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.onclick = async () => {
            await signOut(auth);
            localStorage.clear();
            window.location.href = 'login.html';
        };
    }
    // Ensure login/sign out buttons are toggled after DOM is ready
    requireAuthForPosting();
    // Call the patched loadPosts after everything is ready
    loadPosts();
});

// --- Robustly enforce authentication for posting ---
requireAuthForPosting();

// Run initialization immediately since script is loaded at end of body
initializeTagsInput();
requireAuthForPosting();
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Only allow if logged in
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to post.');
            window.location.href = 'login.html';
            return;
        }
        handleTagInput(document.getElementById('tagsInput'));
        const title = document.getElementById('postTitle').value.trim();
        const body = document.getElementById('postBody').value.trim();
        const tagsValue = document.getElementById('tagsValue').value;
        let tags = [];
        try {
            tags = tagsValue ? JSON.parse(tagsValue) : [];
        } catch (err) {
            tags = [];
        }
        if (!title || !body) return;
        // Get username from localStorage or database
        let author = localStorage.getItem('userName');
        if (!author) {
            // fallback: fetch from database
            const snap = await get(child(ref(database), 'users/' + user.uid));
            if (snap.exists() && snap.val().username) {
                author = snap.val().username;
            } else {
                author = user.uid;
            }
        }
        const postData = {
            title,
            body,
            tags,
            timestamp: Date.now(),
            comments: [],
            author
        };
        try {
            const newPostRef = push(ref(database, 'posts'));
            await set(newPostRef, postData);
            postForm.reset();
            selectedTags = [];
            updateTagsDisplay();
            loadPosts();
        } catch (error) {
            alert('Error posting: ' + (error && error.message ? error.message : error));
            console.error('Error posting:', error);
        }
    });
}

// --- Load and Render Posts ---
const postsList = document.getElementById('postsList');
async function loadPosts(searchTerm = '') {
    console.debug('[loadPosts] called with searchTerm:', searchTerm);
    postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">Loading posts...</div>';
    let postsList = document.getElementById('postsList');
    if (!postsList) {
        console.error('[loadPosts] postsList element not found!');
        return;
    }
    postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">Loading posts...</div>';
    try {
        const snapshot = await get(child(ref(database), 'posts'));
        let posts = [];
        if (snapshot.exists()) {
            posts = Object.entries(snapshot.val()).map(([id, post]) => ({ id, ...post }));
            console.debug('[loadPosts] loaded posts:', posts);
        } else {
            console.debug('[loadPosts] no posts found in database');
        }
        // If searchTerm starts with '#', filter only by tags
        let tagOnly = false;
        let term = searchTerm.trim();
        if (term.startsWith('#')) {
            tagOnly = true;
            term = term.slice(1);
        }
        term = term.toLowerCase();
        if (term) {
            if (tagOnly) {
                posts = posts.filter(post => (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term))));
            } else {
                posts = posts.filter(post =>
                    post.title.toLowerCase().includes(term) ||
                    post.body.toLowerCase().includes(term) ||
                    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
                );
            }
        }
        // If filtering by tag, only show posts with that tag
        if (activeTagFilter) {
            posts = posts.filter(post => (post.tags||[]).includes(activeTagFilter));
            // If no posts have this tag, check if it's a resource-only tag
            const allPostTags = new Set();
            window._lastPostsList = window._lastPostsList || [];
            window._lastPostsList.forEach(post => {
                (post.tags||[]).forEach(tag => allPostTags.add(tag));
            });
            if (!allPostTags.has(activeTagFilter)) {
                postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">No content available for this tag.</div>';
                return;
            }
        }
        posts.sort((a, b) => b.timestamp - a.timestamp);
        renderPosts(posts);
    } catch (err) {
        console.error('[loadPosts] error:', err);
        postsList.innerHTML = '<div style="color:#ff6b6b;text-align:center;">Error loading posts. See console for details.</div>';
    }
}

function renderPosts(posts) {
    console.debug('[renderPosts] posts:', posts);
    if (!posts.length) {
        postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">No posts yet. Be the first to ask a question!</div>';
        return;
    }
    postsList.innerHTML = posts.map(post => `
        <div class="post-card" data-id="${post.id}">
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-meta">${new Date(post.timestamp).toLocaleString()}${post.author ? ` &middot; <span style='color:#5c7aff;'>${escapeHtml(post.author)}</span>` : ''}</div>
            <div class="post-tags">
                ${(post.tags||[]).map(tag => `<span class="post-tag">#${escapeHtml(tag)}</span>`).join(' ')}
            </div>
            <div class="post-body">${escapeHtml(post.body)}</div>
            <div class="comments-section">
                <div class="comments-list">
                    ${(post.comments||[]).map(comment => `
                        <div class="comment">
                            <div class="comment-meta">${escapeHtml(comment.name||'Anonymous')} &middot; ${new Date(comment.timestamp).toLocaleString()}</div>
                            <div>${escapeHtml(comment.text)}</div>
                        </div>
                    `).join('')}
                </div>
                <form class="comment-form" data-id="${post.id}">
                    <input type="text" name="name" placeholder="Your name (optional)">
                    <input type="text" name="comment" placeholder="Add a comment..." required maxlength="300">
                    <button type="submit">Comment</button>
                </form>
            </div>
        </div>
    `).join('');
    requireAuthForPosting(); // Hide comment forms if not logged in
    // Attach comment form listeners
    document.querySelectorAll('.comment-form').forEach(form => {
        // Autofill name if available
        const nameInput = form.elements['name'];
        if (nameInput && localStorage.getItem('userName')) {
            nameInput.value = localStorage.getItem('userName');
        }
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const postId = form.getAttribute('data-id');
            const name = form.elements['name'].value.trim();
            const text = form.elements['comment'].value.trim();
            if (!text) return;
            const comment = {
                name: name || 'Anonymous',
                text,
                timestamp: Date.now()
            };
            // Get current comments, append, and update
            const postSnap = await get(child(ref(database), `posts/${postId}`));
            let comments = [];
            if (postSnap.exists() && postSnap.val().comments) {
                comments = postSnap.val().comments;
            }
            comments.push(comment);
            await update(ref(database, `posts/${postId}`), { comments });
            loadPosts(document.getElementById('searchBar').value.trim());
        });
    });
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[m];
    });
}



// --- Search with tag suggestions and tag filter ---
const searchBar = document.getElementById('searchBar');
const tagSuggestionsDiv = document.getElementById('searchTagSuggestions');
const activeTagFilterDiv = document.getElementById('activeTagFilter');

let searchDebounceTimer = null;
let activeTagFilter = null;
// Gather all tags from posts and resource hub
function getAllTagsForSuggestions() {
    // Tags from posts
    const postTags = new Set();
    window._lastPostsList = window._lastPostsList || [];
    window._lastPostsList.forEach(post => {
        (post.tags||[]).forEach(tag => postTags.add(tag));
    });
    // Tags from resource hub (preloadedTags)
    const resourceTags = Array.isArray(preloadedTags) ? preloadedTags : [];
    // Merge and dedupe
    const allTags = new Set([...postTags, ...resourceTags]);
    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
}

function renderTagSuggestions(input) {
    // If input is empty, hide tag suggestions
    let term = input.trim();
    let tagOnly = false;
    if (!term) {
        tagSuggestionsDiv.innerHTML = '';
        tagSuggestionsDiv.style.display = 'none';
        return;
    }
    if (term.startsWith('#')) {
        tagOnly = true;
        term = term.slice(1);
    }
    term = term.toLowerCase();
    const tagsArr = getAllTagsForSuggestions();
    let matches = tagsArr;
    if (term) {
        matches = tagsArr.filter(tag => tag.toLowerCase().includes(term));
    }
    if (matches.length) {
        tagSuggestionsDiv.innerHTML = matches.map(tag => `<div class="search-tag-bubble${activeTagFilter===tag?' selected':''}" data-tag="${tag}">#${tag}</div>`).join('');
        tagSuggestionsDiv.style.display = 'flex';
        // Match width to search bar
        const searchBarElem = document.getElementById('searchBar');
        if (searchBarElem) {
            tagSuggestionsDiv.style.width = searchBarElem.offsetWidth + 'px';
        }
    } else {
        tagSuggestionsDiv.innerHTML = '';
        tagSuggestionsDiv.style.display = 'none';
    }
    // Add click listeners
    tagSuggestionsDiv.querySelectorAll('.search-tag-bubble').forEach(el => {
        el.onclick = () => {
            activeTagFilter = el.getAttribute('data-tag');
            searchBar.value = '';
            renderActiveTagFilter();
            loadPosts();
        };
    });
}

function renderActiveTagFilter() {
    if (activeTagFilter) {
        activeTagFilterDiv.innerHTML = `Filtering by tag: <span style='background:#5c7aff;color:#fff;border-radius:12px;padding:0.2rem 0.8rem;'>#${activeTagFilter}</span> <button id='clearTagFilterBtn' style='margin-left:0.5rem;background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:1.1em;' title='Clear tag filter'>&times;</button>`;
        activeTagFilterDiv.style.display = '';
        document.getElementById('clearTagFilterBtn').onclick = () => {
            activeTagFilter = null;
            renderActiveTagFilter();
            loadPosts();
        };
    } else {
        activeTagFilterDiv.innerHTML = '';
        activeTagFilterDiv.style.display = 'none';
    }
}


if (searchBar) {
    // Always show tag suggestions (all tags) by default
    renderTagSuggestions('');
    searchBar.addEventListener('focus', function() {
        renderTagSuggestions(searchBar.value);
    });
    searchBar.addEventListener('input', function(e) {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            renderTagSuggestions(searchBar.value);
            loadPosts(searchBar.value.trim());
        }, 200);
    });
    searchBar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            renderTagSuggestions(searchBar.value);
            loadPosts(searchBar.value.trim());
        }
    });
}

// Initial load
// loadPosts();


// Patch loadPosts to support tag filtering and tag suggestions
const _origLoadPosts = loadPosts;
loadPosts = async function(searchTerm = '') {
    let postsList = document.getElementById('postsList');
    if (!postsList) {
        console.error('[loadPosts] postsList element not found!');
        return;
    }
    postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">Loading posts...</div>';
    const snapshot = await get(child(ref(database), 'posts'));
    let posts = [];
    if (snapshot.exists()) {
        posts = Object.entries(snapshot.val()).map(([id, post]) => ({ id, ...post }));
        console.debug('[loadPosts] loaded posts:', posts);
    } else {
        console.debug('[loadPosts] no posts found in database');
    }
    window._lastPostsList = posts;
    renderTagSuggestions(searchBar.value);
    // Tag filter
    if (activeTagFilter) {
        posts = posts.filter(post => (post.tags||[]).includes(activeTagFilter));
        // If no posts have this tag, check if it's a resource-only tag
        const allPostTags = new Set();
        window._lastPostsList = window._lastPostsList || [];
        window._lastPostsList.forEach(post => {
            (post.tags||[]).forEach(tag => allPostTags.add(tag));
        });
        if (!allPostTags.has(activeTagFilter)) {
            postsList.innerHTML = '<div style="color:#b0b8d1;text-align:center;">No content available for this tag.</div>';
            return;
        }
    } else if (searchTerm) {
        const term = searchTerm.toLowerCase();
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(term) ||
            post.body.toLowerCase().includes(term) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }
    posts.sort((a, b) => b.timestamp - a.timestamp);
    renderPosts(posts);
    renderActiveTagFilter();
};
