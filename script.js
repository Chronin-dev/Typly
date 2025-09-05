document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('typly-editor');
    const statsDisplay = document.getElementById('word-count');
    const newBtn = document.getElementById('new-btn');
    const openBtn = document.getElementById('open-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const aboutBtn = document.getElementById('about-btn'); // New: About Button
    const moreOptionsBtn = document.getElementById('more-options-btn');
    const importBtn = document.getElementById('import-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // Open modal and its elements
    const openModal = document.getElementById('open-modal');
    const openFileBtn = document.getElementById('open-file-btn');
    const openModalCloseBtn = openModal.querySelector('.close-btn');

    // Settings modal and its elements
    const settingsModal = document.getElementById('settings-modal');
    const settingsModalCloseBtn = settingsModal.querySelector('.close-btn');

    // New: About modal and its elements
    const aboutModal = document.getElementById('about-modal');
    const aboutModalCloseBtn = aboutModal.querySelector('.close-btn');

    // New: Cache list element
    const cacheList = document.getElementById('cache-list');
    
    // More options menu
    const moreOptionsMenu = document.getElementById('more-options-menu');
    
    // Settings form elements
    const bgColorPicker = document.getElementById('bg-color-picker');
    const fontColorPicker = document.getElementById('font-color-picker');
    const fontSizeInput = document.getElementById('font-size-input');
    const fontFamilySelect = document.getElementById('font-family-select');
    const lineHeightInput = document.getElementById('line-height-input');
    const widthInput = document.getElementById('width-input');
    const statsToggle = document.getElementById('stats-toggle');
    const scrollbarToggle = document.getElementById('scrollbar-toggle');
    const restoreDefaultsBtn = document.getElementById('restore-defaults-btn');
    
    const STORAGE_KEY = 'typly_cache_data';
    const SETTINGS_KEY = 'typly_settings';

    // Default settings object
    const defaultSettings = {
        bgColor: '#f7f7f7',
        fontColor: '#333333',
        fontSize: '20',
        fontFamily: 'sans-serif',
        lineHeight: '1.6',
        width: '800',
        showStats: true,
        showScrollbar: true
    };
    
    // Tracks the index of the currently active file in the cache
    let currentFileIndex = null;

    /**
     * Helper Functions
     */
    const updateStats = (text) => {
        const count = text.length;
        statsDisplay.textContent = `${count} ${count === 1 ? 'character' : 'characters'}`;
    };

    const saveFile = () => {
        const content = editor.value.trim();
        if (content.length === 0) {
            return; // Don't save empty files
        }

        let existingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const title = content.substring(0, 20) || 'New Document';

        const newFile = {
            content: content,
            timestamp: new Date().toISOString(),
            title: title
        };
        
        if (currentFileIndex !== null) {
            // Update existing file
            existingData[currentFileIndex] = newFile;
        } else {
            // Save as a new file, add to the beginning
            existingData.unshift(newFile);
            currentFileIndex = 0; // Set the new file as the current one
        }

        // Trim the array to a maximum of 5 files
        if (existingData.length > 5) {
            existingData = existingData.slice(0, 5);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
        console.log("File saved to cache.");
        renderCacheList(); // Always re-render the list after a save
    };

    // Auto-save every 3 seconds
    setInterval(saveFile, 3000);

    const loadContentFromCache = (item) => {
        editor.value = item.content;
        updateStats(item.content);
        console.log(`Content loaded from browser cache: ${item.title}`);
        openModal.style.display = 'none';
    };

    const deleteCacheItem = (index) => {
        const cachedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (index >= 0 && index < cachedData.length) {
            cachedData.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
            renderCacheList(); // Refresh the list
            if (index === currentFileIndex) {
                // If the current file is deleted, clear the editor and reset the index
                editor.value = '';
                updateStats('');
                currentFileIndex = null;
            }
        }
    };

    const applySettings = (settings) => {
        // Apply to Body
        document.body.style.backgroundColor = settings.bgColor;
        document.body.style.color = settings.fontColor;
        
        // Apply to Editor
        editor.style.color = settings.fontColor;
        editor.style.fontSize = `${settings.fontSize}px`;
        editor.style.fontFamily = settings.fontFamily;
        editor.style.lineHeight = settings.lineHeight;
        editor.style.maxWidth = `${settings.width}px`;

        // Apply to Stats Bar
        document.querySelector('.stats-bar').style.backgroundColor = settings.bgColor === '#f7f7f7' ? '#eee' : settings.bgColor;

        // Apply toggle settings
        document.getElementById('word-count').style.display = settings.showStats ? 'block' : 'none';
        
        if (settings.showScrollbar) {
            editor.style.overflowY = 'auto';
            editor.style.scrollbarWidth = 'auto';
        } else {
            editor.style.overflowY = 'hidden';
            editor.style.scrollbarWidth = 'none';
        }

        // Update form values
        bgColorPicker.value = settings.bgColor;
        fontColorPicker.value = settings.fontColor;
        fontSizeInput.value = settings.fontSize;
        fontFamilySelect.value = settings.fontFamily;
        lineHeightInput.value = settings.lineHeight;
        widthInput.value = settings.width;
        statsToggle.checked = settings.showStats;
        scrollbarToggle.checked = settings.showScrollbar;
        
        updateStats(editor.value);
    };

    const saveSettings = (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    };

    const loadSettings = () => {
        const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return savedSettings || defaultSettings;
    };

    const renderCacheList = () => {
        const cachedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        cacheList.innerHTML = '';
        if (cachedData.length === 0) {
            cacheList.innerHTML = '<p style="text-align: center; color: #888;">No saved files found.</p>';
        } else {
            cachedData.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('cache-item');
                
                // Icon and file info container
                const itemInfo = document.createElement('div');
                itemInfo.classList.add('cache-item-info');
                itemInfo.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    <div class="file-details">
                        <span class="cache-item-title">${item.title}</span>
                        <span class="cache-item-date">${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                `;
                itemInfo.addEventListener('click', () => {
                    currentFileIndex = index;
                    loadContentFromCache(item);
                });
                
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevents click from bubbling to the parent
                    deleteCacheItem(index);
                });

                itemEl.appendChild(itemInfo);
                itemEl.appendChild(deleteBtn);
                cacheList.appendChild(itemEl);
            });
        }
    };

    /**
     * Event Listeners
     */
    editor.addEventListener('input', () => {
        updateStats(editor.value);
    });

    newBtn.addEventListener('click', () => {
        editor.value = '';
        updateStats('');
        currentFileIndex = null; // Reset for a new file
    });

    openBtn.addEventListener('click', () => {
        renderCacheList();
        openModal.style.display = 'flex';
    });
    
    openModalCloseBtn.addEventListener('click', () => {
        openModal.style.display = 'none';
    });

    openFileBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    editor.value = e.target.result;
                    updateStats(editor.value);
                    saveFile();
                    openModal.style.display = 'none';
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    settingsModalCloseBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // New: About button click listener
    aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
    });

    // New: About modal close listener
    aboutModalCloseBtn.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === openModal) {
            openModal.style.display = 'none';
        }
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (event.target === aboutModal) { // New: Close about modal on outside click
            aboutModal.style.display = 'none';
        }
        moreOptionsMenu.style.display = 'none';
    });

    moreOptionsBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = moreOptionsMenu.style.display === 'flex';
        moreOptionsMenu.style.display = isVisible ? 'none' : 'flex';
    });

    // Settings input change listeners
    [bgColorPicker, fontColorPicker, fontSizeInput, fontFamilySelect, lineHeightInput, widthInput].forEach(input => {
        input.addEventListener('input', () => {
            const currentSettings = loadSettings();
            currentSettings.bgColor = bgColorPicker.value;
            currentSettings.fontColor = fontColorPicker.value;
            currentSettings.fontSize = fontSizeInput.value;
            currentSettings.fontFamily = fontFamilySelect.value;
            currentSettings.lineHeight = lineHeightInput.value;
            currentSettings.width = widthInput.value;
            applySettings(currentSettings);
            saveSettings(currentSettings);
        });
    });

    statsToggle.addEventListener('change', () => {
        const currentSettings = loadSettings();
        currentSettings.showStats = statsToggle.checked;
        applySettings(currentSettings);
        saveSettings(currentSettings);
    });

    scrollbarToggle.addEventListener('change', () => {
        const currentSettings = loadSettings();
        currentSettings.showScrollbar = scrollbarToggle.checked;
        applySettings(currentSettings);
        saveSettings(currentSettings);
    });

    restoreDefaultsBtn.addEventListener('click', () => {
        const confirmRestore = confirm('Are you sure you want to restore default settings?');
        if (confirmRestore) {
            applySettings(defaultSettings);
            saveSettings(defaultSettings);
        }
    });

    // Import functionality
    importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    editor.value = e.target.result;
                    updateStats(editor.value);
                    saveFile();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const content = editor.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'typly-document.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Initial load
    const initialSettings = loadSettings();
    applySettings(initialSettings);
    // On page load, try to load the first file from the cache
    const cachedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (cachedData && cachedData[0]) {
        currentFileIndex = 0;
        loadContentFromCache(cachedData[0]);
    } else {
        editor.value = ''; // Ensure editor is empty if no cache exists
    }
});