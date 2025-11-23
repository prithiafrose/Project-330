const API_BASE = "http://localhost:5001/api";

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    console.error("Error fetching history:", err);
    document.getElementById("history-list").innerHTML = "<li class='text-gray-500'>Unable to load history.</li>";
  }
}
function renderHistory(history) {
  const historyList = document.getElementById("history-list");
  if (!history || history.length === 0) {
    historyList.innerHTML = "<li class='text-gray-500'>No recent activity</li>";
    return;
  }

  historyList.innerHTML = history.map(item => `
    <li class="p-2 border rounded flex justify-between items-center">
      <div>
        <span class="font-semibold">${item.actionType}</span>: ${item.title}<br>
        <span class="text-gray-500 text-sm">${new Date(item.timestamp).toLocaleString()}</span>
      </div>
    </li>
  `).join('');
}
document.addEventListener("DOMContentLoaded", () => {





  loadHistory();
});