console.log("content.js loaded"); // confirmation


// --- Explain button ---

let explainButton;

document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const pageUrl = window.location.href;

  if (selectedText.length > 0) {
    const context = getContextFromSelection(selection);
    showExplainButton(event.pageX, event.pageY, selectedText, context, pageUrl);
  } else {
    removeExplainButton();
  }
});

function showExplainButton(x, y, selectedText, context, pageUrl) {
  removeExplainButton();

  explainButton = document.createElement('button');
  explainButton.innerText = 'Explain';
  explainButton.id = 'explain-btn';
  explainButton.style.position = 'absolute';
  explainButton.style.top = `${y-35}px`;
  explainButton.style.left = `${x+20}px`;
  explainButton.style.zIndex = 10000;
  
  explainButton.addEventListener('mousedown', (e) => e.stopPropagation());
  explainButton.addEventListener('mouseup', (e) => e.stopPropagation());
  
  document.body.appendChild(explainButton);

  explainButton.addEventListener('click', () => {
    console.log("🔹 Explain button clicked. Sending message:", selectedText);
    chrome.runtime.sendMessage({ 
      action: 'explain', 
      text: selectedText,
      context: context,
      url: pageUrl
    });
    removeExplainButton();
  });
}

function removeExplainButton() {
  if (explainButton) explainButton.remove();
}

chrome.runtime.onMessage.addListener((message) => {
  console.log("📩 Message received in content.js:", message);
  if (message.action === 'showExplanation') {
    showPopup(message.text, message.selectedText);
  }
});


// --- Main popup ---

function showPopup(explanation, selectedText) {
  const existingPopup = document.getElementById('explAIn-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'explAIn-popup';

  // Header for heading and close btn
  const header = document.createElement('div');
  header.className = 'popup-header';

  const heading = document.createElement('div');
  heading.className = 'popup-heading';
  heading.innerText = (selectedText || '').toString();

  const closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close-btn';
  closeBtn.innerText = '×';
  closeBtn.title = 'Close';
  closeBtn.addEventListener('click', () => popup.remove());

  const content = document.createElement('div');
  content.className = 'popup-content';
  content.innerText = explanation;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'popup-copy-btn';
  copyBtn.innerText = 'Copy';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(explanation);
    copyBtn.innerText = 'Copied!';
    copyBtn.style.color = 'green';
  });

  header.appendChild(heading);
  header.appendChild(closeBtn);

  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(copyBtn);

  document.body.appendChild(popup);
}


// --- helper functions ---

function getContextFromSelection(selection) {
  if (!selection || selection.rangeCount === 0) return "";

  const range = selection.getRangeAt(0);
  const parentElement = range.startContainer.parentNode;

  return parentElement.innerText.trim();
}