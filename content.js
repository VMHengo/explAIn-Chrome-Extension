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
  explainButton.style.top = `${y - 30}px`;
  explainButton.style.left = `${x}px`;
  explainButton.style.zIndex = 10000;
  document.body.appendChild(explainButton);

  explainButton.addEventListener('click', () => {
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
  popup.innerText = explanation;
  popup.style.position = 'fixed';
  popup.style.top = '10px';
  popup.style.right = '10px';
  popup.style.background = '#fff';
  popup.style.border = '1px solid #ccc';
  popup.style.padding = '12px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  popup.style.maxWidth = '300px';
  popup.style.zIndex = 10000;

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 10000);
}
