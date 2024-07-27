// Cria um canal de broadcast
const channel = new BroadcastChannel('localStorage_channel');

// Armazena o tempo ativo
let totalActiveTime = 0;
let startTime = null;
let timerId = null;
let currentTabUrl = null; // Armazena a URL da aba ativa

// Função para extrair a parte relevante da URL
function getCleanUrl(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\.]+)\.com/);
    return match ? match[1] : url;
  }

// Função para iniciar o timer
function startTimer(tabUrl) {
    if (timerId === null) {
      currentTabUrl = getCleanUrl(tabUrl);
      startTime = Date.now();
      let previousTime = 0; // Variável para armazenar o tempo anterior
      timerId = setInterval(() => {
        const currentTime = Date.now();
        const timeDiff = currentTime - startTime; // Calcula o tempo que passou desde o último intervalo
        previousTime += timeDiff; // Soma o tempo que passou ao tempo anterior
        startTime = currentTime; // Atualiza o tempo inicial
        // Atualiza o tempo para a URL limpa
        chrome.storage.local.get([currentTabUrl], (result) => {
          const storedTime = result[currentTabUrl] || 0;
          chrome.storage.local.set({ [currentTabUrl]: storedTime + timeDiff });
        });
      }, 1000);
    }
  }

// Função para parar o timer e salvar o tempo no localStorage
function stopTimer(tabUrl) {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
    totalActiveTime += Date.now() - startTime;
    const cleanUrl = getCleanUrl(tabUrl);
    chrome.storage.local.get([cleanUrl], (result) => {
      const previousTime = result[cleanUrl] || 0;
      chrome.storage.local.set({ [cleanUrl]: previousTime + totalActiveTime });
    });
    totalActiveTime = 0; // Resetar o totalActiveTime para o próximo uso
  }
}

// Quando a aba muda de visibilidade
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    const tabUrl = tab.url;
    if (tabUrl) {
      if (currentTabUrl) {
        stopTimer(tabUrl);
      }
      startTimer(tabUrl);
    }
  });
});

// Quando a aba é atualizada
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const tabUrl = tab.url;
    if (tabUrl) {
      if (currentTabUrl && currentTabUrl !== getCleanUrl(tabUrl)) {
        stopTimer(currentTabUrl);
      }
      startTimer(tabUrl);
    }
  }
});

// Quando o navegador é minimizado ou fechado
// chrome.windows.onFocusChanged.addListener((windowId) => {
//     console.log('windowId',windowId)
//     if (windowId === -1) { // Navegador minimizado ou fechado
//       stopTimer(currentTabUrl);
//     } else if (windowId === chrome.windows.WINDOW_ID_NONE) { // Navegador reaberto
//       startTimer(currentTabUrl);
//     } else if (chrome.extension.getViews({ type: 'popup' }).length > 0) {
//       // Popup da extensão aberto, não parar o timer
//       return;
//     }
//   });
  

// Quando a aba é removida
chrome.tabs.onRemoved.addListener((tabId) => {
    if (currentTabUrl) {
      stopTimer(currentTabUrl);
    }
  });
