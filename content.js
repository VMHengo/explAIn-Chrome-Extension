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
      showPopup(message.text);
    }
  });
  
  function showPopup(explanation) {
    const popup = document.createElement('div');
    popup.id = 'explAIn-popup';
    popup.style.position = 'fixed';
    popup.style.top = '10px';
    popup.style.right = '10px';
    popup.style.background = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '12px 12px 12px 16px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    popup.style.maxWidth = '300px';
    popup.style.zIndex = 10000;
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.gap = '8px';
  
    // Create the close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '×'; // "X" symbol
    closeBtn.style.alignSelf = 'flex-end';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0';
    closeBtn.style.margin = '0';
    closeBtn.title = 'Close';
  
    // Add click listener to remove popup
    closeBtn.addEventListener('click', () => popup.remove());
  
    // Add content
    const content = document.createElement('div');
    content.innerText = explanation;
  
    // Append close button and content to popup
    popup.appendChild(closeBtn);
    popup.appendChild(content);
  
    // Add popup to the page
    document.body.appendChild(popup);
  }
  
