// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(
    { includeUrl: true, contextLength: 200, language: 'en' }, // default values
    (settings) => {
            document.getElementById('includeUrl').checked = settings.includeUrl;
            document.getElementById('contextLength').value = settings.contextLength;
            document.getElementById('languageSelect').value = settings.language;
        }
    );
});

// Save settings
document.getElementById('saveBtn').addEventListener('click', () => {
    const includeUrl = document.getElementById('includeUrl').checked;
    const contextLength = parseInt(document.getElementById('contextLength').value, 10);
    const language = document.getElementById('languageSelect').value;

    chrome.storage.sync.set({ includeUrl, contextLength, language }, () => {
        alert("Settings saved!");
    });
});
  