import { API_KEY } from './config.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'explain') {
    const selectedText = message.text;
    const context = message.context;
    const pageUrl = message.url;

    // Read user settings
    chrome.storage.sync.get(
      { includeUrl: true, contextLength: 200, language: 'en' },
      (settings) => {
        let finalContext = context;

        if (settings.includeUrl) {
          const pageUrl = sender.tab ? sender.tab.url : "";
          finalContext += `\nSource: ${pageUrl}`;
        }

        // You can also use settings.contextLength here if you want to truncate context
        if (settings.contextLength && finalContext.length > settings.contextLength) {
          finalContext = finalContext.slice(0, settings.contextLength) + '...';
        }

        const language = settings.language;

        // Call your explanation function
        getExplanation(selectedText, finalContext, pageUrl, language)
          .then((explanation) => {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'showExplanation',
              text: explanation,
              selectedText: selectedText
            });
          })
          .catch((err) => {
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'showExplanation',
              text: "Error fetching explanation.",
              selectedText: selectedText
            });
            console.error(err);
          });
      }
    );

    return true; // keep the listener alive for async
  }
});


async function getExplanation(text, context, url, language) {
  console.log(text);
  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.2-3B-Instruct:novita",
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: `You are an assistant that gives concise answers without showing your thinking process.
                      Explain the word with the following context: ${context} and source: ${url} in the language of ${language}.
                      Start with something like "A {word} is..." in the respective language. 
                      Do use 2 sentences and do not exceed 50 words.
                      Base all your explanation on scientific research.
                      Dont be overconfident if scientific evidence is missing or scarce.
                      Keep your explanation straightforward and don't use filler words or jargon.
                      Stay professional and academic and explain such that a university student would understand.`,
          },
          {
            role: "user",
            content: `Explain this word: "${text}" in simple terms.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HF API error:", errText);
      return `Error: ${errText}`;
    }

    const data = await response.json();
    let output = data.choices?.[0]?.message?.content || "No explanation found.";

    return output;

  } catch (err) {
    console.error("Fetch error:", err);
    return "Error fetching explanation.";
  }
}







