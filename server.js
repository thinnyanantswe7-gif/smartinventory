let inventory = [];
let nextId = 1;
document.addEventListener('DOMContentLoaded', function() {
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
                        📦 Sell
                    </button>
                    <button onclick="restockItem(${item.id})">📥 Restock</button>
                    <button onclick="deleteItem(${item.id})">🗑️ Delete</button>
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
    
    console.log('Stats updated:', {totalItems, lowStock, outStock, totalValue});
}

function addItem() {
    const name = document.getElementById('itemName').value.trim();
    const qty = parseInt(document.getElementById('itemQty').value) || 0;
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;
    
    if (!name) {
        alert('⚠️ Enter item name!');
        return;
    }
    if (price <= 0) {
        alert('⚠️ Price must be > 0!');
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
        console.log('Sold 1 of item', id);
    }
}

function restockItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveInventory();
        updateDisplay();
        console.log('Restocked item', id);
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
