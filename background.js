chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'explain' || message.action === 'sendFeedback') {

    const selectedText = message.selectedText;
    const context = message.context;
    const pageUrl = message.url;
    let feedback = '';
    if (message.action === 'sendFeedback') {
      feedback = message.feedback;
    }

    // Read user settings
    chrome.storage.sync.get(
      { includeUrl: true, contextLength: 200, language: 'en' },
      (settings) => {

        let finalContext = context;

        if (settings.contextLength && finalContext.length > settings.contextLength) {
          finalContext = finalContext.slice(0, settings.contextLength) + '...';
        }

        const language = settings.language;

        getExplanation(selectedText, finalContext, pageUrl, feedback, language)
          .then((explanation) => {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'showExplanation',
              text: explanation,
              selectedText: selectedText,
              context: finalContext
            });
          })
          .catch((err) => {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'showExplanation',
              text: "Error fetching explanation.",
              selectedText: selectedText,
              context: finalContext
            });
            console.error(err);
          });
      }
    );

    return true; // keep the listener alive for async
  }
});


async function getExplanation(text, context, url, feedback, language) {
  try {
    const response = await fetch("https://explain.vmh-nguyen03.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context, url, feedback, language})
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Worker error:", errText);
      return `Error: ${errText}`;
    }

    const data = await response.json();
    return data.explanation || "No explanation found.";

  } catch (err) {
    console.error("Fetch error:", err);
    return "Error fetching explanation.";
  }
}