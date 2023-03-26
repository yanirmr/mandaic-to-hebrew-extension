function replaceMandaicCharacters(contentDocument) {
  const mandaicLetters =
    "\u{0840}\u{0841}\u{0842}\u{0843}\u{0844}\u{0845}\u{0846}\u{0847}\u{0848}\u{0849}\u{084A}\u{084B}\u{084C}\u{084D}\u{084E}\u{084F}\u{0850}\u{0851}\u{0852}\u{0853}\u{0854}\u{0855}";
  const hebrewLetters = "אבגדחוזהטיכלמנסעפצקרשת";
  const targetTags = ["b", "a"];

  const replaceText = (originalText) => {
    const regex = new RegExp(`[${mandaicLetters}\u{0856}\u{0857}]`, "g");
    return originalText.replace(regex, (match) => {
      if (match === "\u{0856}") {
        return "\u{05D3}\u{05B7}";
      } else if (match === "\u{0857}") {
        return "\u{05DB}\u{05D9}";
      }
      const index = mandaicLetters.indexOf(match);
      return hebrewLetters.charAt(index);
    });
  };

  for (const tag of targetTags) {
    const elements = contentDocument.getElementsByTagName(tag);
    for (const element of elements) {
      if (tag === "a") {
        const originalText = element.childNodes[0]?.nodeValue || "";
        const newText = replaceText(originalText);
        if (newText !== originalText) {
          element.childNodes[0].nodeValue = newText;
        }
      } else {
        const originalText = element.textContent;
        const newText = replaceText(originalText);
        if (newText !== originalText) {
          element.textContent = newText;
        }
      }
    }
  }

  const textNodes = contentDocument.evaluate(
    "//text()",
    contentDocument,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const textNode = textNodes.snapshotItem(i);
    const originalText = textNode.textContent;
    const newText = replaceText(originalText);
    if (newText !== originalText) {
      textNode.textContent = newText;
    }
  }
}


(function () {
  replaceMandaicCharacters(document);
  addLinkEventListeners();
})();


function addLinkEventListeners() {
  const links = document.querySelectorAll("a");
  for (const link of links) {
    link.addEventListener("click", () => {
      setTimeout(() => {
        replaceMandaicCharacters(document);
      }, 500);
    });
  }
}


let lastContentHash = '';

function checkForContentChanges() {
  const iframe = document.querySelector("iframe");
  if (!iframe || !iframe.contentDocument) {
    return;
  }

  const currentContent = iframe.contentDocument.body.innerHTML;
  const currentHash = hashString(currentContent);

  if (currentHash !== lastContentHash) {
    replaceMandaicCharacters(iframe.contentDocument);
    addLinkEventListeners(); //
    lastContentHash = currentHash;
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

setInterval(checkForContentChanges, 1000); // Check for changes every second
