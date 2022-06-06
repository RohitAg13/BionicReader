const NON_READABLE_DOMAINS = [
  "www.youtube.com",
  "www.vimeo.com",
  "www.twitch.com",
  "www.twitter.com",
  "www.facebook.com",
  "www.instagram.com",
  "www.reddit.com",
  "www.linkedin.com",
  "www.pinterest.com",
  "www.quora.com",
  "www.flickr.com",
];
const READER_MODE_STYLES = `
    body{
        margin:40px auto;
        max-width:650px;
        line-height:1.6;
        font-size:18px;
        color:#444;
        padding:0 10px
    }
    h1,h2,h3{
        line-height:1.2
    }
`;

function getPageContent() {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    return selection;
  }
  const readability = new Readability(document.cloneNode(true), {
    charThreshold: 20,
  });
  const article = readability.parse();
  return {
    textContent: article.textContent,
    content: article.content,
    title: article.title,
  };
}

// regex to extract content between the tags
function extractText(content) {
  const regex = /<[^>]*>/g;
  const extractedContent = content.replace(regex, "");
  return extractedContent;
}

function makeBionic(word) {
  if (word.length < 3) {
    return word + " ";
  }
  let wordLength = Math.ceil(word.length / 2);
  let prefix = word.slice(0, wordLength);
  let suffix = word.slice(wordLength);
  return "<b>" + prefix + "</b>" + suffix + " ";
}

function getBionicSentence(content) {
  const lines = content.split("\n");
  let bionicSentences = "";
  lines.forEach((line) => {
    let text = extractText(line);
    let words = new Set(text.split(" "));
    words.forEach((word) => {
      let bionicWord = makeBionic(word);
      line = line.replace(word, bionicWord);
    });
    bionicSentences += line;
  });
  return bionicSentences;
}

chrome.runtime.onMessage.addListener(async (msg) => {
  console.log("[BionicReader] Received message:", msg.type);
  switch (msg.type) {
    case "reader": {
      const { content, title } = getPageContent();
      // Reader Mode
      if (!NON_READABLE_DOMAINS.includes(new URL(location.href).hostname)) {
        console.log("[BionicReader] Updating doc");
        document.body.innerHTML = `
              <html>
                  <style type="text/css">${READER_MODE_STYLES}
                  </style>
                  <body><h1>${title}</h1>
                  ${getBionicSentence(content)}
                  </body>
              </html>
        `;
      }
    }
  }
});
