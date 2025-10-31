console.log("content.js loaded"); // confirmation


// --- Explain button ---

let explainButton;

document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const pageUrl = window.location.href;

  if (selectedText.length > 0) {
    showExplainButton(event.pageX, event.pageY, selection, selectedText, pageUrl);
  } else {
    removeExplainButton();
  }
});

function showExplainButton(x, y, selection, selectedText, pageUrl) {
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
    const context = getContextFromSelection(selection);
    chrome.runtime.sendMessage({ 
      action: 'explain', 
      selectedText: selectedText,
      url: pageUrl,
      context: context,
    });
    removeExplainButton();
  });
}

function removeExplainButton() {
  if (explainButton) explainButton.remove();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showExplanation') {
    showPopup(message.text, message.selectedText, message.context, message.url);
  }
});


// --- Main popup ---

function showPopup(explanation, selectedText, context, url) {
  const existingPopup = document.getElementById('explAIn-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'explAIn-popup';

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

  const footer = document.createElement('div');
  footer.className = 'popup-footer';

  const feedbackInput = document.createElement('textarea');
  feedbackInput.className = 'popup-feedback-input';
  feedbackInput.placeholder = 'Give instructions... ';
  feedbackInput.rows = 2;
  feedbackInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      feedbackInput.blur();
      const pageUrl = window.location.href;
      chrome.runtime.sendMessage({
        action: 'sendFeedback',
        selectedText: selectedText,
        context: context,
        url: pageUrl,
        feedback: feedbackInput.value,
      });
    }
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'popup-copy-btn';
  copyBtn.innerText = ' Copy ';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(explanation);
    copyBtn.innerText = 'Copied!';
    copyBtn.style.color = 'green';
  });

  header.appendChild(heading);
  header.appendChild(closeBtn);

  footer.appendChild(feedbackInput);
  footer.appendChild(copyBtn);

  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(footer);

  document.body.appendChild(popup);
}


// --- helper functions ---

function getContextFromSelection(selection) {
  if (!selection || selection.rangeCount === 0) return "";

  const range = selection.getRangeAt(0);
  const parentElement = range.startContainer.parentNode;

  return parentElement.innerText.trim();
}