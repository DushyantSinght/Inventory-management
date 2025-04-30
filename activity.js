document.addEventListener('DOMContentLoaded', () => {
    let history = JSON.parse(localStorage.getItem('inventoryflow-history')) || [];
    const inventory = JSON.parse(localStorage.getItem('inventoryflow-data')) || [];

    // Debugging logs
    console.log('InventoryFlow Activity: Loaded inventory:', inventory);
    console.log('InventoryFlow Activity: Loaded history:', history);

    // Format number in Indian currency style (₹1,23,456.78)
    function formatIndianCurrency(value) {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(value);
    }

    // Render Low Stock Items (quantity 1–5)
    function updateLowStockTable() {
        const lowStockTable = document.getElementById('low-stock-table');
        if (!lowStockTable) {
            console.error('Low stock table not found.');
            return;
        }

        const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= 5);
        console.log('Low stock items:', lowStockItems);

        let tableHTML = '';
        lowStockItems.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${formatIndianCurrency(item.value)}</td>
                </tr>
            `;
        });
        lowStockTable.innerHTML = tableHTML || '<tr><td colspan="5">No low stock items.</td></tr>';
    }

    // Render Out of Stock Items (quantity 0)
    function updateOutOfStockTable() {
        const outOfStockTable = document.getElementById('out-of-stock-table');
        if (!outOfStockTable) {
            console.error('Out of stock table not found.');
            return;
        }

        const outOfStockItems = inventory.filter(item => item.quantity === 0);
        console.log('Out of stock items:', outOfStockItems);

        let tableHTML = '';
        outOfStockItems.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${formatIndianCurrency(item.value)}</td>
                </tr>
            `;
        });
        outOfStockTable.innerHTML = tableHTML || '<tr><td colspan="5">No out of stock items.</td></tr>';
    }

    // Render Inventory History
    function updateHistoryTable() {
        const historyTable = document.getElementById('history-table');
        if (!historyTable) {
            console.error('History table not found.');
            return;
        }

        console.log('Rendering history:', history);

        let tableHTML = '';
        history.forEach(event => {
            const item = event.item || {};
            tableHTML += `
                <tr>
                    <td>${new Date(event.timestamp).toLocaleString('en-IN')}</td>
                    <td>${event.action}</td>
                    <td>${item.id || ''}</td>
                    <td>${item.name || ''}</td>
                    <td>${item.category || ''}</td>
                    <td>${item.quantity !== undefined ? item.quantity : ''}</td>
                    <td>${item.value !== undefined ? formatIndianCurrency(item.value) : ''}</td>
                </tr>
            `;
        });
        historyTable.innerHTML = tableHTML || '<tr><td colspan="7">No history available.</td></tr>';
    }

    // Clear Inventory History
    function clearHistory() {
        if (confirm('Are you sure you want to clear all inventory history? This action cannot be undone.')) {
            history = [];
            localStorage.setItem('inventoryflow-history', JSON.stringify(history));
            console.log('InventoryFlow Activity: History cleared.');
            updateHistoryTable();
            // Assuming showAlert is defined in script.js
            if (typeof showAlert === 'function') {
                showAlert('Inventory history cleared successfully!', 'success');
            } else {
                console.log('showAlert not available, using alert.');
                alert('Inventory history cleared successfully!');
            }
        }
    }

    // Event listener for Clear History button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    } else {
        console.error('Clear history button not found.');
    }

    // Initialize tables
    updateLowStockTable();
    updateOutOfStockTable();
    updateHistoryTable();
});