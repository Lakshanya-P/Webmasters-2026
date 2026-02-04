// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEjbKjo7bLbXsLm2FFS3nb5TjXNXMg2lc",
    authDomain: "mhig-edde5.firebaseapp.com",
    projectId: "mhig-edde5",
    storageBucket: "mhig-edde5.appspot.com",
    messagingSenderId: "855050639590",
    appId: "1:855050639590:web:84c985fb7c8e066681c327"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// US States array
const usStates = [
    "Online/Across the Country","Alabama", "Alaska", "Arizona", "Arkansas", "California",
    "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Preloaded tags array
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

// Track selected tags in the form
let selectedTags = [];

// Global variables
let allEntries = [];
let currentDetailId = null;
let selectedState = null;
let selectedGradeLevel = null;
let currentSearchTerm = '';
let currentSearchTag = null; // Track selected search tag filter
let currentCarouselImageIndex = 0;
let carouselImages = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded'); // Debug log
    setupEventListeners();
    initializeStateDropdown();
    initializeGradeLevelDropdown();
    populateFormStateSelect();
    loadEntries();
});

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Initialize grade levels multiselect
function initializeGradeLevelsMultiselect() {
    const button = document.getElementById('gradeLevelsButton');
    const dropdown = document.getElementById('gradeLevelsDropdown');
    const hiddenInput = document.getElementById('gradeLevelsValue');
    const bubblesContainer = document.getElementById('selectedGradesBubbles');
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

    // Toggle dropdown
    button.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
    });

    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multiselect-container')) {
            dropdown.classList.remove('active');
        }
    });
}

function updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer) {
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Update hidden input
    hiddenInput.value = selected.length > 0 ? JSON.stringify(selected) : '';
    
    // Update placeholder visibility
    const placeholder = document.getElementById('gradeLevelsPlaceholder');
    if (selected.length > 0) {
        placeholder.classList.add('hidden');
    } else {
        placeholder.classList.remove('hidden');
    }
    
    // Update bubbles display
    bubblesContainer.innerHTML = '';
    
    // Check for special cases
    const highschoolGrades = ['9th grade', '10th grade', '11th grade', '12th grade'];
    const allOptions = ['9th grade', '10th grade', '11th grade', '12th grade', 'Post-Highschool education'];
    const hasAllHighschool = highschoolGrades.every(grade => selected.includes(grade));
    const hasAllOptions = allOptions.every(option => selected.includes(option));
    
    if (hasAllOptions) {
        // Show "Everyone!" bubble
        const bubble = document.createElement('div');
        bubble.className = 'grade-bubble';
        
        const label = document.createElement('span');
        label.textContent = 'Everyone!';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'grade-bubble-close';
        closeBtn.textContent = '×';
        closeBtn.type = 'button';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Uncheck all checkboxes
            checkboxes.forEach(cb => cb.checked = false);
            updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer);
        });
        
        bubble.appendChild(label);
        bubble.appendChild(closeBtn);
        bubblesContainer.appendChild(bubble);
    } else if (hasAllHighschool) {
        // Show "All Highschool Grades" bubble
        const bubble = document.createElement('div');
        bubble.className = 'grade-bubble';
        
        const label = document.createElement('span');
        label.textContent = 'All Highschool Grades';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'grade-bubble-close';
        closeBtn.textContent = '×';
        closeBtn.type = 'button';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Uncheck high school checkboxes
            highschoolGrades.forEach(grade => {
                const checkboxToUncheck = Array.from(checkboxes).find(cb => cb.value === grade);
                if (checkboxToUncheck) checkboxToUncheck.checked = false;
            });
            updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer);
        });
        
        bubble.appendChild(label);
        bubble.appendChild(closeBtn);
        bubblesContainer.appendChild(bubble);
        
        // Show remaining non-highschool grades (e.g., Post-Highschool education)
        const nonHighschool = selected.filter(grade => !highschoolGrades.includes(grade));
        nonHighschool.forEach(gradeLevel => {
            const bubble = document.createElement('div');
            bubble.className = 'grade-bubble';
            
            const label = document.createElement('span');
            label.textContent = gradeLevel;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'grade-bubble-close';
            closeBtn.textContent = '×';
            closeBtn.type = 'button';
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const checkboxToUncheck = Array.from(checkboxes).find(cb => cb.value === gradeLevel);
                if (checkboxToUncheck) {
                    checkboxToUncheck.checked = false;
                    updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer);
                }
            });
            
            bubble.appendChild(label);
            bubble.appendChild(closeBtn);
            bubblesContainer.appendChild(bubble);
        });
    } else {
        // Show individual bubbles
        selected.forEach(gradeLevel => {
            const bubble = document.createElement('div');
            bubble.className = 'grade-bubble';
            
            const label = document.createElement('span');
            label.textContent = gradeLevel;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'grade-bubble-close';
            closeBtn.textContent = '×';
            closeBtn.type = 'button';
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Uncheck the corresponding checkbox
                const checkboxToUncheck = Array.from(checkboxes).find(cb => cb.value === gradeLevel);
                if (checkboxToUncheck) {
                    checkboxToUncheck.checked = false;
                    updateGradeLevelsBubbles(checkboxes, hiddenInput, bubblesContainer);
                }
            });
            
            bubble.appendChild(label);
            bubble.appendChild(closeBtn);
            bubblesContainer.appendChild(bubble);
        });
    }
}

// Initialize state dropdown with search functionality
function initializeStateDropdown() {
    const stateSearchInput = document.getElementById('stateSearch');
    const stateDropdown = document.getElementById('stateDropdown');
    const stateFilterInput = document.getElementById('stateFilterInput');
    const stateOptions = document.getElementById('stateOptions');

    // Populate state options
    populateStateOptions();

    // Toggle dropdown when clicking on search input
    stateSearchInput.addEventListener('click', function() {
        stateDropdown.classList.toggle('active');
        if (stateDropdown.classList.contains('active')) {
            stateFilterInput.focus();
        }
    });

    // Filter states as user types
    stateFilterInput.addEventListener('input', function(e) {
        const filterValue = e.target.value.toLowerCase();
        const options = document.querySelectorAll('.state-option');
        
        options.forEach(option => {
            const stateName = option.textContent.toLowerCase();
            if (stateName.includes(filterValue)) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.state-dropdown-container')) {
            stateDropdown.classList.remove('active');
        }
    });
}

// Initialize grade level dropdown
function initializeGradeLevelDropdown() {
    const gradeLevelSearchInput = document.getElementById('gradeLevelSearch');
    const gradeLevelDropdown = document.getElementById('gradeLevelDropdown');
    const gradeLevelOptions = gradeLevelDropdown.querySelectorAll('.state-option');

    // Toggle dropdown when clicking on search input
    gradeLevelSearchInput.addEventListener('click', function() {
        gradeLevelDropdown.classList.toggle('active');
    });

    // Handle option selection
    gradeLevelOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            selectedGradeLevel = value;
            gradeLevelSearchInput.value = this.textContent;
            gradeLevelDropdown.classList.remove('active');
            document.getElementById('clearGradeLevelBtn').style.display = 'flex';
            applyFilters();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const containers = document.querySelectorAll('.state-dropdown-container');
        let clickedInside = false;
        containers.forEach(container => {
            if (container.contains(e.target)) clickedInside = true;
        });
        if (!clickedInside) {
            gradeLevelDropdown.classList.remove('active');
        }
    });
}

// Populate state options in dropdown
function populateStateOptions() {
    const stateOptions = document.getElementById('stateOptions');
    stateOptions.innerHTML = '';
    
    usStates.forEach(state => {
        const option = document.createElement('div');
        option.className = 'state-option';
        option.textContent = state;
        option.addEventListener('click', function() {
            selectedState = state;
            document.getElementById('stateSearch').value = state;
            document.getElementById('stateFilterInput').value = '';
            document.getElementById('stateDropdown').classList.remove('active');
            document.getElementById('clearStateBtn').style.display = 'flex';
            applyFilters();
        });
        stateOptions.appendChild(option);
    });
}

// Populate state select in form
function populateFormStateSelect() {
    initializeGradeLevelsMultiselect();
    initializeFormStateDropdown();
}

// Initialize form state dropdown with search functionality
function initializeFormStateDropdown() {
    const formStateInput = document.getElementById('formStateInput');
    const formStateDropdown = document.getElementById('formStateDropdown');
    const formStateFilterInput = document.getElementById('formStateFilterInput');
    const formStateOptions = document.getElementById('formStateOptions');
    let selectedFormState = null;

    // Populate form state options
    usStates.forEach(state => {
        const option = document.createElement('div');
        option.className = 'form-state-option';
        option.textContent = state;
        option.addEventListener('click', function() {
            selectedFormState = state;
            document.getElementById('formStateInput').value = state;
            document.getElementById('formStateValue').value = state;
            document.getElementById('formStateFilterInput').value = '';
            document.getElementById('formStateDropdown').classList.remove('active');
        });
        formStateOptions.appendChild(option);
    });

    // Toggle dropdown when clicking on search input
    formStateInput.addEventListener('click', function() {
        formStateDropdown.classList.toggle('active');
        if (formStateDropdown.classList.contains('active')) {
            formStateFilterInput.focus();
        }
    });

    // Filter states as user types
    formStateFilterInput.addEventListener('input', function(e) {
        const filterValue = e.target.value.toLowerCase();
        const options = document.querySelectorAll('.form-state-option');
        
        options.forEach(option => {
            const stateName = option.textContent.toLowerCase();
            if (stateName.includes(filterValue)) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.form-state-dropdown-container')) {
            formStateDropdown.classList.remove('active');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners'); // Debug log
    
    const addBtn = document.getElementById('addBtn');
    const searchBar = document.getElementById('searchBar');
    const searchSubmitBtn = document.getElementById('searchSubmitBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const clearStateBtn = document.getElementById('clearStateBtn');
    const clearGradeLevelBtn = document.getElementById('clearGradeLevelBtn');
    const closeAddBtn = document.getElementById('closeAddBtn');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const addForm = document.getElementById('addForm');
    const picturesInput = document.getElementById('picturesInput');
    
    if (addBtn) {
        console.log('Add button found, attaching listener'); // Debug log
        addBtn.addEventListener('click', openAddModal);
    }
    
    if (searchBar) {
        searchBar.addEventListener('input', function(e) {
            handleSearchInput(e);
            // Show/hide clear button
            const clearBtn = document.getElementById('clearSearchBtn');
            if (e.target.value.trim()) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        });
        searchBar.addEventListener('focus', handleSearchInput);
        searchBar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = e.target.value.toLowerCase().trim();
                currentSearchTerm = searchTerm;
                document.getElementById('searchSuggestions').classList.remove('active');
                applyFilters();
            }
        });
    }
    
    if (searchSubmitBtn) {
        searchSubmitBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchBar').value.toLowerCase().trim();
            currentSearchTerm = searchTerm;
            document.getElementById('searchSuggestions').classList.remove('active');
            applyFilters();
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            document.getElementById('searchBar').value = '';
            currentSearchTerm = '';
            currentSearchTag = null;
            clearSearchBtn.style.display = 'none';
            document.getElementById('searchSuggestions').classList.remove('active');
            applyFilters();
        });
    }
    
    if (clearStateBtn) {
        clearStateBtn.addEventListener('click', function() {
            document.getElementById('stateSearch').value = '';
            document.getElementById('stateFilterInput').value = '';
            selectedState = null;
            clearStateBtn.style.display = 'none';
            applyFilters();
        });
    }
    
    if (clearGradeLevelBtn) {
        clearGradeLevelBtn.addEventListener('click', function() {
            document.getElementById('gradeLevelSearch').value = '';
            selectedGradeLevel = null;
            clearGradeLevelBtn.style.display = 'none';
            applyFilters();
        });
    }
    
    if (closeAddBtn) {
        closeAddBtn.addEventListener('click', closeAddModal);
    }
    
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeDetailModal);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteEntry);
    }
    
    // Carousel navigation
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    if (carouselPrev) {
        carouselPrev.addEventListener('click', prevCarouselImage);
    }
    if (carouselNext) {
        carouselNext.addEventListener('click', nextCarouselImage);
    }
    
    if (addForm) {
        console.log('Add form found, attaching submit listener'); // Debug log
        addForm.addEventListener('submit', submitForm);
    } else {
        console.log('Add form NOT found'); // Debug log
    }
    
    if (picturesInput) {
        picturesInput.addEventListener('change', handleFileUpload);
    }
}

// Carousel navigation functions
function nextCarouselImage() {
    if (carouselImages.length === 0) return;
    currentCarouselImageIndex = (currentCarouselImageIndex + 1) % carouselImages.length;
    updateCarouselDisplay();
}

function prevCarouselImage() {
    if (carouselImages.length === 0) return;
    currentCarouselImageIndex = (currentCarouselImageIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarouselDisplay();
}

function updateCarouselDisplay() {
    const img = document.getElementById('carouselImage');
    const counter = document.getElementById('carouselCounter');
    if (carouselImages.length > 0) {
        img.src = carouselImages[currentCarouselImageIndex];
        counter.textContent = `${currentCarouselImageIndex + 1} / ${carouselImages.length}`;
    }
}

// Open add modal
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    document.getElementById('addForm').reset();
    selectedTags = [];
    updateTagsDisplay();
    initializeTagsInput();
}

// Close add modal
function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    selectedTags = [];
}

// Initialize tags input
function initializeTagsInput() {
    const tagsInput = document.getElementById('tagsInput');
    const tagsAutocomplete = document.getElementById('tagsAutocomplete');
    let selectedOptionIndex = -1;
    
    if (!tagsInput) return;
    
    tagsInput.addEventListener('input', function(e) {
        const value = e.target.value;
        selectedOptionIndex = -1; // Reset selection when typing
        
        // Show autocomplete only if user typed '#'
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
        
        // Arrow down - navigate autocomplete options
        if (e.key === 'ArrowDown' && hasOptions) {
            e.preventDefault();
            selectedOptionIndex = Math.min(selectedOptionIndex + 1, options.length - 1);
            updateSelectedOption(options, selectedOptionIndex);
        }
        // Arrow up - navigate autocomplete options
        else if (e.key === 'ArrowUp' && hasOptions) {
            e.preventDefault();
            selectedOptionIndex = Math.max(selectedOptionIndex - 1, -1);
            updateSelectedOption(options, selectedOptionIndex);
        }
        // On spacebar, create tag
        else if (e.code === 'Space' && e.target.value.includes('#')) {
            // Only create tag if no option is selected
            if (selectedOptionIndex === -1) {
                e.preventDefault();
                handleTagInput(tagsInput);
            }
        }
        // On Enter, either select highlighted option or create tag
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedOptionIndex >= 0 && hasOptions) {
                // Click the selected option
                options[selectedOptionIndex].click();
                selectedOptionIndex = -1;
            } else if (e.target.value.includes('#')) {
                handleTagInput(tagsInput);
            }
        }
        // On backspace, remove tag if input is empty
        else if (e.key === 'Backspace' && e.target.value === '' && selectedTags.length > 0) {
            e.preventDefault();
            selectedTags.pop();
            updateTagsDisplay();
        }
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tags-input-container')) {
            tagsAutocomplete.innerHTML = '';
            selectedOptionIndex = -1;
        }
    });
}

// Update the selected option styling
function updateSelectedOption(options, index) {
    options.forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('tag-option-selected');
        } else {
            opt.classList.remove('tag-option-selected');
        }
    });
    
    // Scroll into view if needed
    if (index >= 0) {
        options[index].scrollIntoView({ block: 'nearest' });
    }
}

// Show tag autocomplete suggestions
function showTagAutocomplete(input, container) {
    const filtered = preloadedTags.filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase())
    );
    
    container.innerHTML = '';
    
    if (filtered.length === 0) return;
    
    // Position dropdown under the input field
    const tagsInput = document.getElementById('tagsInput');
    const rect = tagsInput.getBoundingClientRect();
    container.style.top = (rect.bottom + 4) + 'px';
    container.style.left = rect.left + 'px';
    container.style.width = (rect.width - 24) + 'px'; // Account for container padding
    
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

// Handle tag input on spacebar/enter
function handleTagInput(input) {
    const value = input.value.trim();
    
    if (!value.includes('#')) return;
    
    // Extract tag name (remove #)
    let tagName = value.substring(value.lastIndexOf('#') + 1).trim();
    
    if (tagName.length === 0) return;
    
    // Capitalize first letter of each word for consistency
    tagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    
    // Check if tag already selected
    if (selectedTags.includes(tagName)) {
        alert('This tag is already selected');
        input.value = '';
        return;
    }
    
    // Check max tags
    if (selectedTags.length >= 15) {
        alert('Maximum 15 tags allowed');
        input.value = '';
        return;
    }
    
    addTag(tagName);
    input.value = '';
    document.getElementById('tagsAutocomplete').innerHTML = '';
}

// Add tag to selected tags
function addTag(tag) {
    if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
        updateTagsDisplay();
    }
}

// Remove tag from selected tags
function removeTag(index) {
    selectedTags.splice(index, 1);
    updateTagsDisplay();
}

// Update tags display and counter
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
    
    // Show/hide placeholder based on whether tags exist
    if (tagsInput) {
        if (selectedTags.length > 0) {
            tagsInput.placeholder = '';
        } else {
            tagsInput.placeholder = 'type #niche about your extracurricular (hit space to add more)';
        }
    }
    
    // Update hidden input
    hiddenInput.value = selectedTags.length > 0 ? JSON.stringify(selectedTags) : '';
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailId = null;
}

// Handle file uploads
function handleFileUpload(event) {
    const files = event.target.files;
    const filesDisplay = document.getElementById('uploadedFilesDisplay');
    filesDisplay.innerHTML = '';
    
    // Store file names for display (we'll convert to base64 when submitting)
    Array.from(files).forEach((file, index) => {
        const fileBubble = document.createElement('div');
        fileBubble.className = 'file-bubble';
        fileBubble.dataset.index = index;
        
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'file-bubble-close';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Remove the file from the input
            const dt = new DataTransfer();
            const input = document.getElementById('picturesInput');
            Array.from(input.files).forEach((file, i) => {
                if (i !== index) {
                    dt.items.add(file);
                }
            });
            input.files = dt.files;
            handleFileUpload({ target: input });
        });
        
        fileBubble.appendChild(fileName);
        fileBubble.appendChild(removeBtn);
        filesDisplay.appendChild(fileBubble);
    });
}

// Submit form
async function submitForm(event) {
    if (event) event.preventDefault();
    
    try {
        const title = document.getElementById('titleInput').value.trim();
        const gradeLevelsValue = document.getElementById('gradeLevelsValue').value;
        const gradeLevels = gradeLevelsValue ? JSON.parse(gradeLevelsValue) : [];
        const tagsValue = document.getElementById('tagsValue').value;
        const tags = tagsValue ? JSON.parse(tagsValue) : [];
        const state = document.getElementById('formStateValue').value || document.getElementById('formStateInput').value;
        const picturesFiles = document.getElementById('picturesInput').files;
        const linksInput = document.getElementById('linksInput').value.trim();
        const helpfulInfo = document.getElementById('helpfulInfoInput').value.trim();

        // Validation with HTML5 popups
        if (!title) {
            document.getElementById('titleInput').focus();
            document.getElementById('titleInput').reportValidity();
            return;
        }
        
        if (!gradeLevels || gradeLevels.length === 0) {
            alert('Please select at least one grade level');
            return;
        }
        
        if (!tags || tags.length === 0 || tags.length < 3) {
            alert('Please add at least 3 tags to describe the program');
            return;
        }
        
        if (!state) {
            document.getElementById('formStateInput').focus();
            document.getElementById('formStateInput').reportValidity();
            return;
        }

        // Convert file uploads to base64
        const pictures = [];
        for (let i = 0; i < picturesFiles.length; i++) {
            const file = picturesFiles[i];
            const base64 = await fileToBase64(file);
            pictures.push({
                name: file.name,
                data: base64
            });
        }
        
        // Parse links (split by newlines)
        const links = linksInput ? linksInput.split('\n').filter(l => l.trim()) : [];

        console.log('Submitting:', { title, gradeLevels, tags, state, pictures, links, helpfulInfo }); // Debug log

        // Save to Firebase with title as the key
        const dbRef = ref(database, 'directory/' + title);
        console.log('Database reference created:', dbRef); // Debug log
        
        await set(dbRef, {
            gradeLevels: gradeLevels,
            tags: tags,
            state: state,
            pictures: pictures,
            links: links,
            helpfulInfo: helpfulInfo
        });

        console.log('Entry saved successfully'); // Debug log
        alert('Program added successfully!');
        closeAddModal();
        await loadEntries();
    } catch (error) {
        console.error('Error adding entry:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        alert('Error adding entry: ' + error.message);
    }
}

// Load entries from Firebase
async function loadEntries() {
    try {
        const snapshot = await get(child(ref(database), 'directory'));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Convert Firebase object to array with title as property
            allEntries = Object.keys(data).map(title => ({
                title: title,
                gradeLevels: data[title].gradeLevels || '',
                tags: data[title].tags || '',
                state: data[title].state || '',
                pictures: data[title].pictures || [],
                links: data[title].links || [],
                helpfulInfo: data[title].helpfulInfo || ''
            }));
        } else {
            allEntries = [];
        }

        // Sort entries alphabetically by title
        allEntries.sort((a, b) => a.title.localeCompare(b.title));
        displayCards(allEntries);
    } catch (error) {
        console.error('Error loading entries:', error);
    }
}

// If page opened with #add or ?open=add, open the Add New Entry modal
function _maybeOpenAddFromUrl() {
    try {
        const qs = new URLSearchParams(window.location.search);
        if (window.location.hash === '#add' || qs.get('open') === 'add') {
            // small timeout so UI is ready
            setTimeout(() => {
                if (typeof openAddModal === 'function') openAddModal();
                // scroll to top so modal is visible
                window.scrollTo(0,0);
            }, 80);
        }
    } catch (e) {
        console.warn('Could not parse URL for add modal', e);
    }
}

window.addEventListener('DOMContentLoaded', _maybeOpenAddFromUrl);
window.addEventListener('hashchange', _maybeOpenAddFromUrl);

// Display cards
function displayCards(entries) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';

    if (entries.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No entries found</p>';
        return;
    }

    // Sort entries alphabetically by title
    const sortedEntries = [...entries].sort((a, b) => {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });

    // Group entries by first letter
    const grouped = {};
    sortedEntries.forEach(entry => {
        const firstChar = entry.title.charAt(0).toUpperCase();
        const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
        
        if (!grouped[letter]) {
            grouped[letter] = [];
        }
        grouped[letter].push(entry);
    });

    // Create sections for each letter
    const letters = Object.keys(grouped).sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
    });

    letters.forEach(letter => {
        // Create letter header
        const letterHeader = document.createElement('div');
        letterHeader.className = 'letter-header';
        letterHeader.textContent = '~ ' + letter + ' ~';
        container.appendChild(letterHeader);

        // Create cards for this letter
        grouped[letter].forEach(entry => {
            const card = document.createElement('div');
            card.className = 'directory-card';
            card.innerHTML = `
                <div class="card-title">${entry.title}</div>
                <div class="card-subtitle">${entry.tags} | ${entry.state}</div>
            `;
            card.addEventListener('click', function() {
                showDetailModal(entry);
            });
            container.appendChild(card);
        });
    });
}

// Show detail modal
function showDetailModal(entry) {
    currentDetailId = entry.title;
    document.getElementById('detailTitle').textContent = entry.title;
    
    // Handle grade levels as array or string
    const gradeLevelsText = Array.isArray(entry.gradeLevels) 
        ? entry.gradeLevels.join(', ') 
        : entry.gradeLevels;
    document.getElementById('detailGradeLevels').textContent = gradeLevelsText;
    
    // Handle tags as array or string
    let tagsText = '';
    if (Array.isArray(entry.tags)) {
        tagsText = entry.tags.map(tag => '#' + tag).join(', ');
    } else if (typeof entry.tags === 'string') {
        try {
            const tagsArray = JSON.parse(entry.tags);
            tagsText = tagsArray.map(tag => '#' + tag).join(', ');
        } catch (e) {
            tagsText = entry.tags;
        }
    }
    document.getElementById('detailTags').textContent = tagsText;
    document.getElementById('detailState').textContent = entry.state;

    // Display pictures/media in carousel
    const carouselSection = document.getElementById('carouselSection');
    if (entry.pictures && entry.pictures.length > 0) {
        // Extract image sources (handle both old URL format and new base64 format)
        carouselImages = entry.pictures.map(pic => typeof pic === 'string' ? pic : pic.data);
        currentCarouselImageIndex = 0;
        carouselSection.style.display = 'block';
        updateCarouselDisplay();
    } else {
        carouselSection.style.display = 'none';
        carouselImages = [];
    }

    // Display links
    const linksSection = document.getElementById('detailLinksSection');
    const detailLinksDiv = document.getElementById('detailLinks');
    if (entry.links && entry.links.length > 0) {
        linksSection.style.display = 'block';
        detailLinksDiv.innerHTML = entry.links.map(link => 
            `<a href="${link}" target="_blank" style="display: block; color: #4CAF50; text-decoration: none; margin: 5px 0; word-break: break-all;">${link}</a>`
        ).join('');
    } else {
        linksSection.style.display = 'none';
    }

    // Display helpful information
    const infoSection = document.getElementById('detailInfoSection');
    if (entry.helpfulInfo) {
        infoSection.style.display = 'block';
        document.getElementById('detailInfo').textContent = entry.helpfulInfo;
    } else {
        infoSection.style.display = 'none';
    }

    document.getElementById('detailModal').classList.add('active');
}

// Delete entry
async function deleteEntry() {
    if (!currentDetailId) return;
    
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        await remove(ref(database, 'directory/' + currentDetailId));
        closeDetailModal();
        loadEntries();
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry. Please try again.');
    }
}

// Handle search input with suggestions
function handleSearchInput(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (searchTerm.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }
    
    // Find matching program entries
    const programMatches = allEntries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Limit to 5 suggestions
    
    // Find matching tags from all entries
    const matchingTags = new Set();
    allEntries.forEach(entry => {
        let entryTags = [];
        if (Array.isArray(entry.tags)) {
            entryTags = entry.tags;
        } else if (typeof entry.tags === 'string') {
            try {
                entryTags = JSON.parse(entry.tags);
            } catch (e) {
                entryTags = [];
            }
        }
        
        entryTags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                matchingTags.add(tag);
            }
        });
    });
    
    // Display suggestions
    let html = '';
    
    // Add program suggestions
    if (programMatches.length > 0) {
        html += '<div class="search-suggestions-section">';
        html += programMatches.map(entry => {
            const title = entry.title;
            const highlightedTitle = highlightMatch(title, searchTerm);
            return `
                <div class="search-suggestion-item" data-title="${title}">
                    <div class="suggestion-title">${highlightedTitle}</div>
                    <div class="suggestion-meta">${entry.state || ''}</div>
                </div>
            `;
        }).join('');
        html += '</div>';
    }
    
    // Add tag suggestions
    if (matchingTags.size > 0) {
        html += '<div class="search-suggestions-tags">';
        Array.from(matchingTags).forEach(tag => {
            const highlightedTag = highlightMatch(tag, searchTerm);
            html += `<div class="search-tag-bubble" data-tag="${tag}">#${highlightedTag}</div>`;
        });
        html += '</div>';
    }
    
    if (html) {
        suggestionsContainer.innerHTML = html;
        
        // Add click listeners to program suggestions
        suggestionsContainer.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-title');
                document.getElementById('searchBar').value = title;
                currentSearchTerm = title.toLowerCase();
                suggestionsContainer.classList.remove('active');
                applyFilters();
            });
        });
        
        // Add click listeners to tag suggestions
        suggestionsContainer.querySelectorAll('.search-tag-bubble').forEach(item => {
            item.addEventListener('click', () => {
                const tag = item.getAttribute('data-tag');
                document.getElementById('searchBar').value = '#' + tag;
                currentSearchTerm = '';
                currentSearchTag = tag;
                suggestionsContainer.classList.remove('active');
                applyFilters();
            });
        });
        
        suggestionsContainer.classList.add('active');
    } else {
        suggestionsContainer.classList.remove('active');
    }
    
    // Don't filter until Enter is pressed
}

// Highlight matching text in suggestion
function highlightMatch(text, searchTerm) {
    const index = text.toLowerCase().indexOf(searchTerm);
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);
    
    return `${before}<strong style="color: #4CAF50;">${match}</strong>${after}`;
}

// Clear all filters
function clearAllFilters() {
    // Clear search
    currentSearchTerm = '';
    document.getElementById('searchBar').value = '';
    document.getElementById('searchSuggestions').classList.remove('active');
    document.getElementById('clearSearchBtn').style.display = 'none';
    
    // Clear state filter
    selectedState = null;
    document.getElementById('stateSearch').value = '';
    document.getElementById('stateFilterInput').value = '';
    document.getElementById('clearStateBtn').style.display = 'none';
    
    // Clear grade level filter
    selectedGradeLevel = null;
    document.getElementById('gradeLevelSearch').value = '';
    document.getElementById('clearGradeLevelBtn').style.display = 'none';
    
    // Reapply filters (which will show all entries)
    applyFilters();
}

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.search-container');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (searchContainer && !searchContainer.contains(e.target)) {
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('active');
        }
    }
});

// Filter by name (legacy function, now handled by handleSearchInput)
function filterByName(e) {
    currentSearchTerm = e.target.value.toLowerCase();
    applyFilters();
}

// Filter by state
function filterByState(state) {
    selectedState = state;
    applyFilters();
}

// Apply all filters cumulatively
function applyFilters() {
    let filtered = allEntries;
    
    // Apply title search filter
    if (currentSearchTerm) {
        filtered = filtered.filter(entry => 
            entry.title.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    // Apply tag search filter
    if (currentSearchTag) {
        filtered = filtered.filter(entry => {
            if (!entry.tags) return false;
            let entryTags = [];
            if (Array.isArray(entry.tags)) {
                entryTags = entry.tags;
            } else if (typeof entry.tags === 'string') {
                try {
                    entryTags = JSON.parse(entry.tags);
                } catch (e) {
                    entryTags = [];
                }
            }
            return entryTags.includes(currentSearchTag);
        });
    }
    
    // Apply state filter
    if (selectedState) {
        filtered = filtered.filter(entry => entry.state === selectedState);
    }
    
    // Apply grade level filter
    if (selectedGradeLevel) {
        filtered = filtered.filter(entry => {
            if (!entry.gradeLevels) return false;
            // gradeLevels is already an array from Firebase
            const gradeLevels = Array.isArray(entry.gradeLevels) ? entry.gradeLevels : JSON.parse(entry.gradeLevels);
            
            if (selectedGradeLevel === 'Everyone') {
                return gradeLevels.includes('9th grade') && 
                       gradeLevels.includes('10th grade') && 
                       gradeLevels.includes('11th grade') && 
                       gradeLevels.includes('12th grade') && 
                       gradeLevels.includes('Post-Highschool education');
            } else if (selectedGradeLevel === 'All Highschool Grades') {
                return gradeLevels.includes('9th grade') && 
                       gradeLevels.includes('10th grade') && 
                       gradeLevels.includes('11th grade') && 
                       gradeLevels.includes('12th grade');
            } else {
                return gradeLevels.includes(selectedGradeLevel);
            }
        });
    }
    
    displayCards(filtered);
}
