let inventory = [];
let nextId = 1;
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded, initializing inventory...');
    const saved = localStorage.getItem('smartInventory');
    if (saved) {
        const data = JSON.parse(saved);
        inventory = data.items || [];
        nextId = data.nextId || 1;
        console.log('Loaded', inventory.length, 'items from storage');
    } else {
        console.log('No saved data, starting empty');
    }

    document.getElementById('searchInput').addEventListener('input', updateDisplay);

    updateDisplay();

    // Check for out-of-stock items on load and show persistent alerts
    inventory.forEach(item => {
        if (item.quantity === 0) {
            showAlert(`❌ ${item.name} is Out of Stock!`, 'error', true);
        }
    });
});

function updateDisplay() {
    renderTable();
    updateStats();
}

function renderTable() {
    const tbody = document.getElementById('inventoryTable');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filteredItems = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );

    tbody.innerHTML = filteredItems.map(item => {
        const rowClass = item.quantity === 0 ? 'out-stock' :
            (item.quantity <= 5 ? 'low-stock' : '');
        const totalValue = item.quantity * item.price;

        return `
            <tr class="${rowClass}">
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td><strong>${item.quantity}</strong></td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td>$${Number(totalValue).toFixed(2)}</td>
                <td>
                    <button onclick="sellItem(${item.id})" ${item.quantity === 0 ? 'disabled style="opacity:0.5"' : ''}>
                        📦 Borrow
                    </button>
                    <button onclick="restockItem(${item.id})">📥 Return</button>
                    <button onclick="deleteItem(${item.id})">🗑️ Remove</button>
                </td>
            </tr>
        `;
    }).join('');

    console.log('Table rendered with', filteredItems.length, 'items');
}

function updateStats() {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= 5).length;
    const outStock = inventory.filter(i => i.quantity === 0).length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.price), 0);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('outStock').textContent = outStock;
    document.getElementById('totalValue').textContent = `$${Number(totalValue).toFixed(2)}`;

    console.log('Stats updated:', { totalItems, lowStock, outStock, totalValue });
}

function addItem() {
    const name = document.getElementById('itemName').value.trim();
    const qty = parseInt(document.getElementById('itemQty').value) || 0;
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;

    if (!name) {
        showAlert('⚠️ Enter item name!', 'warning');
        return;
    }
    if (price <= 0) {
        showAlert('⚠️ Price must be > 0!', 'warning');
        return;
    }

    const newItem = {
        id: nextId++,
        name: name,
        quantity: qty,
        price: price
    };

    inventory.unshift(newItem);
    saveInventory();
    updateDisplay();

    document.getElementById('itemName').value = '';
    document.getElementById('itemQty').value = '';
    document.getElementById('itemPrice').value = '';

    console.log('Added item:', newItem);
}

function sellItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item && item.quantity > 0) {
        item.quantity--;
        saveInventory();
        updateDisplay();
        console.log('Borrowed 1 of item', id);

        if (item.quantity === 0) {
            showAlert(`❌ ${item.name} is now Out of Stock!`, 'error', true);
        } else if (item.quantity <= 5) {
            showAlert(`⚠️ ${item.name} the few book left(${item.quantity} left)`, 'warning');
        }
    }
}

function showAlert(message, type = 'info', persistent = false) {
    let container = document.getElementById('alertContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'alert-container';
        document.body.appendChild(container);
    }

    const alertBox = document.createElement('div');
    alertBox.className = `alert-box alert-${type}`;
    
    alertBox.innerHTML = `
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(alertBox);

    if (!persistent) {
        setTimeout(() => {
            if (document.body.contains(alertBox)) alertBox.remove();
        }, 5000);
    }
}

function restockItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveInventory();
        updateDisplay();
        console.log('Return item', id);
    }
}

function deleteItem(id) {
    if (confirm('Delete this item permanently?')) {
        inventory = inventory.filter(i => i.id !== id);
        saveInventory();
        updateDisplay();
        console.log('Deleted item', id);
    }
}

function resetData() {
    if (confirm('Reset ALL data? (Start fresh empty inventory)')) {
        inventory = [];
        nextId = 1;
        localStorage.removeItem('smartInventory');
        updateDisplay();
        console.log('Inventory reset');
    }
}

function saveInventory() {
    localStorage.setItem('smartInventory', JSON.stringify({
        items: inventory,
        nextId: nextId
    }));
}
