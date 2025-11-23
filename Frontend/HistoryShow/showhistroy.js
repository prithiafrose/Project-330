const API_BASE = "http://localhost:5001/api";

let currentPage = 1;
let currentFilters = {
  action_type: '',
  start_date: '',
  end_date: '',
  limit: 20
};

const historyTableBody = document.getElementById('historyTableBody');
const pagination = document.getElementById('pagination');
const totalActions = document.getElementById('totalActions');
const actionStats = document.getElementById('actionStats');
const clearModal = document.getElementById('clearModal');
const loadingOverlay = document.getElementById('loadingOverlay');

document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  loadStats();
  setupEventListeners();
});

function setupEventListeners() {

  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadHistory();
    loadStats();
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    clearModal.style.display = 'block';
  });

  document.getElementById('confirmClear').addEventListener('click', confirmClearHistory);
  document.getElementById('cancelClear').addEventListener('click', () => {
    clearModal.style.display = 'none';
  });

  document.querySelectorAll('input[name="clearOption"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const clearActionType = document.getElementById('clearActionType');
      const clearBeforeDate = document.getElementById('clearBeforeDate');
      
      clearActionType.disabled = e.target.value !== 'type';
      clearBeforeDate.disabled = e.target.value !== 'date';
    });
  });

  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);

  window.addEventListener('click', (e) => {
    if (e.target === clearModal) {
      clearModal.style.display = 'none';
    }
  });
}

async function loadHistory() {
  showLoading(true);
  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: currentFilters.limit,
      ...currentFilters
    });

    for (const [key, value] of [...params.entries()]) {
      if (!value) params.delete(key);
    }

    const response = await fetch(`${API_BASE}/history?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      renderHistory(result.data);
      renderPagination(result.pagination);
    } else {
      throw new Error(result.message || 'Failed to load history');
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="error">
          Failed to load history: ${error.message}
        </td>
      </tr>
    `;
  } finally {
    showLoading(false);
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/history/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      renderStats(result.data);
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">No history found</td>
      </tr>
    `;
    return;
  }

  historyTableBody.innerHTML = history.map(item => `
    <tr>
      <td><span class="action-badge ${item.action_type.toLowerCase()}">${item.action_type}</span></td>
      <td>${item.item_type || '-'}</td>
      <td>${item.item_name || '-'}</td>
      <td class="details-cell">${item.details || '-'}</td>
      <td class="url-cell">${item.page_url || '-'}</td>
      <td>${formatDate(item.timestamp)}</td>
    </tr>
  `).join('');
}

function renderPagination(paginationData) {
  if (!paginationData || paginationData.totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  const { currentPage, totalPages, totalItems, itemsPerPage } = paginationData;
  
  let paginationHTML = `
    <div class="pagination-info">
      Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} 
      of ${totalItems} items
    </div>
    <div class="pagination-controls">
  `;

  paginationHTML += `
    <button 
      class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
      onclick="changePage(${currentPage - 1})"
      ${currentPage === 1 ? 'disabled' : ''}>
      Previous
    </button>
  `;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button 
        class="pagination-btn ${i === currentPage ? 'active' : ''}" 
        onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  paginationHTML += `
    <button 
      class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
      onclick="changePage(${currentPage + 1})"
      ${currentPage === totalPages ? 'disabled' : ''}>
      Next
    </button>
  `;

  paginationHTML += '</div>';
  pagination.innerHTML = paginationHTML;
}

function renderStats(data) {
  const { stats, totalActions: total } = data;
  
  totalActions.textContent = total || 0;

  if (stats && stats.length > 0) {
    actionStats.innerHTML = stats.map(stat => `
      <div class="stat-card">
        <h3>${stat.action_type}</h3>
        <span class="stat-number">${stat.count}</span>
      </div>
    `).join('');
  } else {
    actionStats.innerHTML = '<div class="stat-card"><h3>No data</h3></div>';
  }
}

function changePage(page) {
  currentPage = page;
  loadHistory();
}

function applyFilters() {
  currentFilters = {
    action_type: document.getElementById('actionTypeFilter').value,
    start_date: document.getElementById('startDate').value,
    end_date: document.getElementById('endDate').value,
    limit: parseInt(document.getElementById('limitFilter').value)
  };
  
  currentPage = 1;
  loadHistory();
}

function resetFilters() {
  document.getElementById('actionTypeFilter').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('limitFilter').value = '20';
  
  currentFilters = {
    action_type: '',
    start_date: '',
    end_date: '',
    limit: 20
  };
  
  currentPage = 1;
  loadHistory();
}

async function confirmClearHistory() {
  const clearOption = document.querySelector('input[name="clearOption"]:checked').value;
  
  let requestBody = {};
  
  if (clearOption === 'type') {
    requestBody.action_type = document.getElementById('clearActionType').value;
  } else if (clearOption === 'date') {
    requestBody.before_date = document.getElementById('clearBeforeDate').value;
  }

  showLoading(true);
  
  try {
    const response = await fetch(`${API_BASE}/history`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      alert(`History cleared successfully! ${result.deletedCount} entries deleted.`);
      clearModal.style.display = 'none';
      loadHistory();
      loadStats();
    } else {
      throw new Error(result.message || 'Failed to clear history');
    }
  } catch (error) {
    console.error("Error clearing history:", error);
    alert(`Failed to clear history: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function showLoading(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}
