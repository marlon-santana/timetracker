document.addEventListener('DOMContentLoaded', () => {
    // Recupera dados do armazenamento local
    chrome.storage.local.get(null, (items) => {
      const tbody = document.querySelector('#timeTable tbody');
      tbody.innerHTML = ''; // Limpa a tabela existente
  
      for (const [url, time] of Object.entries(items)) {
        // Extrai a parte relevante da URL para exibição
        const displayUrl = getCleanUrl(url);
        const row = document.createElement('tr');
        const urlCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const deleteButtonCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash-alt';
        deleteButton.appendChild(deleteIcon);
  
        urlCell.textContent = displayUrl;
        timeCell.textContent = formatTime(time);
        // deleteButton.textContent = 'Apagar';
        deleteButton.addEventListener('click', () => {
          // Remove a linha da tabela
          row.remove();
          // Remove o item do armazenamento local
          chrome.storage.local.remove(url);
        });
  
        row.appendChild(urlCell);
        row.appendChild(timeCell);
        row.appendChild(deleteButtonCell);
        deleteButtonCell.appendChild(deleteButton);
        tbody.appendChild(row);
      }
    });
  });
  
  // Função para formatar o tempo em horas, minutos e segundos
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  
  // Função para extrair a parte relevante da URL
  function getCleanUrl(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\.]+)\.com/);
    return match ? match[1] : url;
  }