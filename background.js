// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//     if (message.action === 'explain') {
//       const explanation = await getExplanation(message.text);
//       chrome.tabs.sendMessage(sender.tab.id, { action: 'showExplanation', text: explanation });
//     }
//   });
  
//   async function getExplanation(text) {
//     // Example: replace this with your LLM API endpoint
//     const response = await fetch('https://your-llm-endpoint.com/explain', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ text })
//     });
  
//     const data = await response.json();
//     return data.explanation || 'No explanation found.';
//   }

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ explAIn background loaded");
});

chrome.runtime.onMessage.addListener((message, sender) => {
  console.log("📩 Background received:", message);

  if (message.action === 'explain') {
    const testExplanation = `This is a hardcoded explanation for: "${message.text}"`;

    // Send back to the tab that sent it
    chrome.tabs.sendMessage(sender.tab.id, {
      action: 'showExplanation',
      text: testExplanation
    });
  }
});
