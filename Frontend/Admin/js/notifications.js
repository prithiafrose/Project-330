class NotificationManager {
    constructor() {
        this.notifBtn = document.getElementById("notifBtn");
        this.notifDropdown = document.getElementById("notifDropdown");
        this.notifList = document.getElementById("notifList");
        this.notifCount = document.getElementById("notifCount");
        
        this.init();
    }

    init() {
        if (!this.notifBtn || !this.notifDropdown) return;

        this.notifBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener("click", (e) => {
            if (!this.notifBtn.contains(e.target) && !this.notifDropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });

        this.loadNotifications();
    }

    toggleDropdown() {
        const isVisible = this.notifDropdown.style.display === "block";
        this.notifDropdown.style.display = isVisible ? "none" : "block";
    }

    hideDropdown() {
        this.notifDropdown.style.display = "none";
    }

    async loadNotifications() {
        try {
            const res = await fetchWithAuth("/admin/notifications");
            if (!res) return;

            const data = await res.json();
            this.updateNotificationUI(data);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            this.showErrorState();
        }
    }

    updateNotificationUI(data) {
        this.notifCount.textContent = data.count || 0;

        this.notifList.innerHTML = "";

        if (!data.list || data.list.length === 0) {
            this.notifList.innerHTML = "<li>No notifications</li>";
        } else {
            data.list.forEach(notif => {
                const li = document.createElement("li");
                li.textContent = notif.message;
                li.addEventListener("click", () => {
                    this.handleNotificationClick(notif);
                });
                this.notifList.appendChild(li);
            });
        }
    }

    showErrorState() {
        this.notifList.innerHTML = "<li>Failed to load notifications</li>";
        this.notifCount.textContent = "0";
    }

    handleNotificationClick(notif) {
        console.log("Notification clicked:", notif);
        this.hideDropdown();
        
        if (notif.actionUrl) {
            window.location.href = notif.actionUrl;
        }
    }

    refresh() {
        this.loadNotifications();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.notificationManager = new NotificationManager();
});

window.NotificationManager = NotificationManager;