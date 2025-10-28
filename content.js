console.log("content.js loaded");

let explainButton;

document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    showExplainButton(event.pageX, event.pageY, selection);
  } else {
    removeExplainButton();
  }
});

function showExplainButton(x, y, text) {
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
    console.log("🔹 Explain button clicked. Sending message:", text);
    chrome.runtime.sendMessage({ action: 'explain', text });
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
  
function showPopup(explanation, selectedText) {
  const existingPopup = document.getElementById('explAIn-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'explAIn-popup';

  // Header for heading and close btn
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '4px';

  // Heading
  const heading = document.createElement('div');
  heading.innerText = `${(selectedText || '').toString().toLowerCase()} - explAIn`;
  heading.style.fontWeight = 'bold';
  heading.style.fontSize = '20px';
  heading.style.textDecoration = 'none';
  heading.style.alignSelf = 'flex-end';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerText = '×';
  closeBtn.style.alignSelf = 'flex-start';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.padding = '0';
  closeBtn.style.margin = '0';
  closeBtn.title = 'Close';

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.color = 'red';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.color = '#333';
  });
  closeBtn.addEventListener('click', () => popup.remove());

  header.appendChild(heading);
  header.appendChild(closeBtn);
  
  // Clipboard button
  const copyToClipboardBtn = document.createElement('button');
  copyToClipboardBtn.innerText = 'Copy';
  copyToClipboardBtn.style.alignSelf = 'flex-end';
  copyToClipboardBtn.style.background = 'transparent';
  copyToClipboardBtn.style.border = 'none';
  copyToClipboardBtn.style.fontSize = '12px';
  copyToClipboardBtn.style.cursor = 'pointer';
  copyToClipboardBtn.style.padding = '0';
  copyToClipboardBtn.style.margin = '0';
  copyToClipboardBtn.title = 'Copy to clipboard';

  copyToClipboardBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(explanation);
    copyToClipboardBtn.innerText = 'Copied!';;
    copyToClipboardBtn.style.color = 'green';
  });

  const content = document.createElement('div');
  content.innerText = explanation;
  
  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(copyToClipboardBtn);

  document.body.appendChild(popup);
}
  
