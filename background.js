import { API_KEY } from './config.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'explain') {
    getExplanation(message.text)
      .then((explanation) => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showExplanation',
          text: explanation
        });
      })
      .catch((err) => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showExplanation',
          text: "Error fetching explanation."
        });
        console.error(err);
      });
    return true; // keep listener alive
  }
});

function stripThinking(text) {
  // Remove <think>...</think> blocks and trim extra whitespace
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}


async function getExplanation(text) {

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
                      Explain in context of Computer Science.
                      Start with something like "A {word} is...".
                      Do not use more than 2 sentences and do not exceed 50 words.
                      Base all your explanation on scientific research in Computer Science.
                      Keep your explanation straightforward and don't use filler words or jargon.
                      Stay professional and academic.`,
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
      tempPopup.remove(); // remove temporary popup
      return `Error: ${errText}`;
    }

    const data = await response.json();
    let output = data.choices?.[0]?.message?.content || "No explanation found.";
    output = stripThinking(output); // your existing cleanup function

    return output;

  } catch (err) {
    console.error("Fetch error:", err);
    tempPopup.remove(); // remove temporary popup
    return "Error fetching explanation.";
  }
}

// async function getExplanation(text) {

//   try {
//     const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "deepseek-ai/DeepSeek-R1:novita",
//         max_tokens: 100, // <-- Point 1: limit output length for speed
//         messages: [
//           {
//             role: "system",
//             content: `You are an assistant that gives concise answers without showing your thinking process.
//                       Do not use more than 2 sentences and do not exceed 50 words.
//                       Base all your explanation on scientific research and only fill missing information with Wikipedia.
//                       Keep your explanation straightforward and don't use filler words or jargon.
//                       Stay professional and academic.`,
//           },
//           {
//             role: "user",
//             content: `Explain this word: "${text}" in simple terms and in context of Computer Science.`,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       const errText = await response.text();
//       console.error("HF API error:", errText);
//       tempPopup.remove(); // remove temporary popup
//       return `Error: ${errText}`;
//     }

//     const data = await response.json();
//     let output = data.choices?.[0]?.message?.content || "No explanation found.";
//     output = stripThinking(output); // your existing cleanup function

//     return output;

//   } catch (err) {
//     console.error("Fetch error:", err);
//     tempPopup.remove(); // remove temporary popup
//     return "Error fetching explanation.";
//   }
// }







