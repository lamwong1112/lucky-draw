// 幸運抽獎系統 JavaScript 功能

class LuckyDrawApp {
    constructor() {
        this.items = [];
        this.history = [];
        this.isDrawing = false;
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initTheme();
        this.bindEvents();
        this.renderItems();
        this.renderHistory();
    }

    initTheme() {
        // 檢查本地儲存的主題偏好
        const savedTheme = localStorage.getItem('luckyDrawTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // 檢查系統偏好
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            }
        }
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        
        if (this.currentTheme === 'dark') {
            themeToggle.textContent = '☀️ 淺色模式';
        } else {
            themeToggle.textContent = '🌙 深色模式';
        }
        
        localStorage.setItem('luckyDrawTheme', this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        // 顯示主題切換訊息
        const themeText = this.currentTheme === 'dark' ? '深色模式' : '淺色模式';
        this.showMessage(`已切換到${themeText}`, 'info');
    }

    bindEvents() {
        // 主題切換按鈕
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 新增項目按鈕
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.addItem();
        });

        // 抽獎按鈕
        document.getElementById('drawBtn').addEventListener('click', () => {
            this.startDraw();
        });

        // 清空所有項目按鈕
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllItems();
        });

        // 清空歷史記錄按鈕
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // 輸入框按鍵事件
        document.getElementById('itemInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        });
    }

    addItem() {
        const input = document.getElementById('itemInput');
        const itemText = input.value.trim();
        
        if (itemText === '') {
            this.showMessage('請輸入抽獎項目！', 'warning');
            return;
        }

        if (this.items.includes(itemText)) {
            this.showMessage('此項目已存在！', 'warning');
            return;
        }

        this.items.push(itemText);
        input.value = '';
        this.renderItems();
        this.saveToStorage();
        this.showMessage(`已新增項目：${itemText}`, 'success');
    }

    removeItem(index) {
        const removedItem = this.items[index];
        this.items.splice(index, 1);
        this.renderItems();
        this.saveToStorage();
        this.showMessage(`已移除項目：${removedItem}`, 'info');
    }

    clearAllItems() {
        if (this.items.length === 0) {
            this.showMessage('沒有項目可清空！', 'warning');
            return;
        }

        if (confirm('確定要清空所有抽獎項目嗎？')) {
            this.items = [];
            this.renderItems();
            this.saveToStorage();
            this.showMessage('已清空所有項目！', 'success');
        }
    }

    startDraw() {
        if (this.items.length === 0) {
            this.showMessage('請先新增抽獎項目！', 'warning');
            return;
        }

        if (this.isDrawing) {
            return;
        }

        this.isDrawing = true;
        const drawBtn = document.getElementById('drawBtn');
        const resultText = document.getElementById('resultText');
        
        // 開始動畫效果
        drawBtn.disabled = true;
        drawBtn.textContent = '🎲 抽獎中...';
        resultText.textContent = '正在抽獎...';
        
        // 隨機切換顯示效果
        let counter = 0;
        const interval = setInterval(() => {
            const randomItem = this.items[Math.floor(Math.random() * this.items.length)];
            resultText.textContent = randomItem;
            counter++;
            
            if (counter > 20) {
                clearInterval(interval);
                this.finishDraw();
            }
        }, 100);
    }

    finishDraw() {
        const randomIndex = Math.floor(Math.random() * this.items.length);
        const selectedItem = this.items[randomIndex];
        
        // 更新顯示
        document.getElementById('resultText').textContent = `🎉 恭喜！抽中：${selectedItem} 🎉`;
        
        // 記錄到歷史
        const timestamp = new Date().toLocaleString('zh-TW');
        this.history.unshift({
            item: selectedItem,
            time: timestamp
        });
        
        // 限制歷史記錄數量
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.renderHistory();
        this.saveToStorage();
        
        // 重置按鈕狀態
        const drawBtn = document.getElementById('drawBtn');
        drawBtn.disabled = false;
        drawBtn.textContent = '🎯 抽獎';
        
        this.isDrawing = false;
        
        // 顯示成功訊息
        this.showMessage(`抽獎完成！結果：${selectedItem}`, 'success');
        
        // 播放音效（如果支援）
        this.playSound();
    }

    playSound() {
        // 創建簡單的音效
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // 如果不支援音效，就忽略
        }
    }

    clearHistory() {
        if (this.history.length === 0) {
            this.showMessage('沒有歷史記錄可清空！', 'warning');
            return;
        }

        if (confirm('確定要清空所有歷史記錄嗎？')) {
            this.history = [];
            this.renderHistory();
            this.saveToStorage();
            this.showMessage('已清空所有歷史記錄！', 'success');
        }
    }

    renderItems() {
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        
        if (this.items.length === 0) {
            itemsList.innerHTML = '<li style="text-align: center; color: var(--text-secondary);">暫無項目</li>';
            return;
        }
        
        this.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item}</span>
                <button class="remove-item" onclick="app.removeItem(${index})">刪除</button>
            `;
            itemsList.appendChild(li);
        });
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<li style="text-align: center; color: var(--text-secondary);">暫無記錄</li>';
            return;
        }
        
        this.history.forEach(record => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${record.item}</span>
                <small style="color: var(--text-secondary);">${record.time}</small>
            `;
            historyList.appendChild(li);
        });
    }

    showMessage(message, type = 'info') {
        // 創建訊息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // 樣式設定
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 根據類型設定背景色
        const colors = {
            success: '#48bb78',
            warning: '#ed8936',
            error: '#e53e3e',
            info: '#4299e1'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(messageDiv);
        
        // 顯示動畫
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // 自動隱藏
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        try {
            localStorage.setItem('luckyDrawItems', JSON.stringify(this.items));
            localStorage.setItem('luckyDrawHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('無法儲存到本地儲存空間');
        }
    }

    loadFromStorage() {
        try {
            const savedItems = localStorage.getItem('luckyDrawItems');
            const savedHistory = localStorage.getItem('luckyDrawHistory');
            
            if (savedItems) {
                this.items = JSON.parse(savedItems);
            }
            
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
        } catch (e) {
            console.warn('無法從本地儲存空間載入資料');
        }
    }
}

// 頁面載入完成後初始化應用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LuckyDrawApp();
    
    // 添加一些預設項目作為範例
    if (window.app.items.length === 0) {
        const defaultItems = [
            'iPhone 15 Pro',
            'MacBook Air',
            'AirPods Pro',
            'iPad Air',
            'Apple Watch',
            '現金紅包 $1000',
            '現金紅包 $500',
            '現金紅包 $200',
            '謝謝參與',
            '再試一次'
        ];
        
        window.app.items = defaultItems;
        window.app.renderItems();
        window.app.saveToStorage();
    }
});

// 添加鍵盤快捷鍵支援
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                if (document.getElementById('itemInput') === document.activeElement) {
                    window.app.addItem();
                } else {
                    window.app.startDraw();
                }
                break;
            case 'n':
                e.preventDefault();
                document.getElementById('itemInput').focus();
                break;
            case 'd':
                e.preventDefault();
                window.app.startDraw();
                break;
        }
    }
});
