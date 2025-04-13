const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

let inventory = JSON.parse(localStorage.getItem('inventory')) || [
    { id: '001', name: 'Steel Rod', category: 'Raw Materials', quantity: 50, value: 100, alerted: false },
    { id: '002', name: 'Gear Box', category: 'Components', quantity: 5, value: 500, alerted: false },
    { id: '003', name: 'Bolts', category: 'Fasteners', quantity: 200, value: 20, alerted: false }
];

const elements = {
    productTable: document.getElementById('product-table'),
    itemForm: document.getElementById('item-creation-form'),
    searchInput: document.getElementById('search'),
    totalItemsCount: document.querySelector('#total-items .count'),
    lowStockCount: document.querySelector('#low-stock .count'),
    categoriesCount: document.querySelector('#categories .count'),
    heatmap: document.getElementById('heatmap'),
    chartCanvas: document.getElementById('inventory-chart'),
    modeToggle: document.getElementById('mode-toggle'),
    body: document.body,
    canvas: document.getElementById('nebula-canvas'),
    quickAddToggle: document.getElementById('quick-add-toggle'),
    quickAddForm: document.getElementById('quick-add-form'),
    voiceBtn: document.getElementById('voice-btn'),
    headline: document.querySelector('.hero-headline'),
    topItemName: document.getElementById('top-item-name'),
    topItemQty: document.getElementById('top-item-qty'),
    valueChartCanvas: document.getElementById('value-chart'),
    alertsContainer: document.getElementById('alerts')
};

const ctx = elements.canvas?.getContext('2d');
let particles = [];
let inventoryChart = null;
let valueChart = null;

function renderInventory(items) {
    if (!elements.productTable) return;
    elements.productTable.innerHTML = '';
    items.forEach(item => {
        const status = item.quantity === 0 ? 'out' : item.quantity < 10 ? 'low' : 'in-stock';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td class="${item.quantity < 10 ? 'low-stock' : ''}">${item.quantity}</td>
            <td>$${item.value}</td>
            <td><span class="status-badge status-${status}">${status.replace('-', ' ')}</span></td>
            <td>
                <button onclick="editItem('${item.id}')">Edit</button>
                <button onclick="deleteItem('${item.id}')">Delete</button>
            </td>
        `;
        elements.productTable.appendChild(row);
    });
    updateDashboard();
}

function updateDashboard() {
    if (!elements.totalItemsCount || !elements.lowStockCount || !elements.categoriesCount) return;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const totalItems = inventory.length;
            const lowStockItems = inventory.filter(item => item.quantity < 10);
            const categories = new Set(inventory.map(item => item.category)).size;
            const topItem = inventory.reduce((max, item) => item.quantity > max.quantity ? item : max, inventory[0] || { name: 'None', quantity: 0 });

            animateCount(elements.totalItemsCount, totalItems);
            animateCount(elements.lowStockCount, lowStockItems.length);
            animateCount(elements.categoriesCount, categories);
            if (elements.topItemName && elements.topItemQty) {
                elements.topItemName.textContent = topItem.name;
                elements.topItemQty.textContent = topItem.quantity;
            }
            updateHeatmap();
            updateChart();
            updateValueChart();

            lowStockItems.forEach(item => {
                if (!item.alerted) {
                    showAlert(`Low Stock Alert: ${item.name} (${item.quantity} left)`);
                    item.alerted = true;
                }
            });
            observer.disconnect();
        }
    }, { threshold: 0.1 });
    observer.observe(document.getElementById('dashboard'));
}

function animateCount(element, target) {
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    element.setAttribute('data-target', target);

    function update() {
        start += step;
        element.textContent = start >= target ? target : Math.round(start);
        if (start < target) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function updateHeatmap() {
    if (!elements.heatmap) return;
    elements.heatmap.innerHTML = '';
    inventory.forEach(item => {
        const heatItem = document.createElement('div');
        heatItem.className = 'heatmap-item';
        heatItem.textContent = item.quantity;
        heatItem.style.background = elements.body.classList.contains('dark-mode')
            ? (item.quantity < 10 ? 'linear-gradient(135deg, #ff00cc, #ffcc00)' :
               item.quantity < 50 ? 'linear-gradient(135deg, #ffcc00, #00ffcc)' :
               'linear-gradient(135deg, #00ffcc, #00ff99)')
            : (item.quantity < 10 ? '#f56565' : item.quantity < 50 ? '#ecc94b' : '#48bb78');
        elements.heatmap.appendChild(heatItem);
    });
}

function updateChart() {
    if (!elements.chartCanvas || !window.Chart) return;
    const categories = {};
    inventory.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.quantity;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (inventoryChart) inventoryChart.destroy();

    inventoryChart = new Chart(elements.chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Quantity',
                data: data,
                backgroundColor: elements.body.classList.contains('dark-mode')
                    ? 'rgba(0, 255, 204, 0.7)'
                    : 'rgba(74, 144, 226, 0.7)',
                borderColor: elements.body.classList.contains('dark-mode')
                    ? '#00ffcc'
                    : '#4a90e2',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Quantity' } },
                x: { title: { display: true, text: 'Categories' } }
            }
        }
    });
}

function updateValueChart() {
    if (!elements.valueChartCanvas || !window.Chart) return;
    const labels = inventory.map(item => item.name);
    const data = inventory.map(item => item.value * item.quantity);

    if (valueChart) valueChart.destroy();

    valueChart = new Chart(elements.valueChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Value',
                data: data,
                backgroundColor: elements.body.classList.contains('dark-mode')
                    ? 'rgba(255, 0, 204, 0.7)'
                    : 'rgba(255, 107, 107, 0.7)',
                borderColor: elements.body.classList.contains('dark-mode')
                    ? '#ff00cc'
                    : '#ff6b6b',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Value ($)' } },
                x: { title: { display: true, text: 'Items' } }
            }
        }
    });
}

function createParticle() {
    return {
        x: Math.random() * (elements.canvas?.width || window.innerWidth),
        y: Math.random() * (elements.canvas?.height || window.innerHeight),
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 0.3 - 0.15,
        speedY: Math.random() * 0.3 - 0.15,
        opacity: Math.random() * 0.6 + 0.4,
        hue: Math.random() * 360,
        life: Math.random() * 100 + 50
    };
}

function animateNebula(timestamp) {
    if (!ctx || !elements.body.classList.contains('dark-mode')) return;
    const now = performance.now();
    if (now - (animateNebula.lastFrame || 0) < 33) {
        requestAnimationFrame(animateNebula);
        return;
    }
    animateNebula.lastFrame = now;

    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    if (particles.length < 100) particles.push(createParticle());
    particles = particles.filter(p => p.life > 0);
    particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.5;
        p.opacity = Math.sin(now * 0.001 + index) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.opacity * (p.life / 100)})`;
        ctx.fill();
    });
    requestAnimationFrame(animateNebula);
}
animateNebula.lastFrame = 0;

if (elements.itemForm) {
    elements.itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id')?.value || String(inventory.length + 1).padStart(3, '0');
        const name = document.getElementById('item-name')?.value.trim();
        const category = document.getElementById('item-category')?.value.trim();
        const quantity = parseInt(document.getElementById('item-quantity')?.value || 0);
        const value = parseFloat(document.getElementById('item-value')?.value || 0);

        if (!name || !category || isNaN(quantity) || quantity < 0 || isNaN(value) || value < 0) {
            showAlert('Please fill all fields correctly!');
            return;
        }

        const existingItemIndex = inventory.findIndex(item => item.id === id);
        if (existingItemIndex > -1) {
            inventory[existingItemIndex] = { id, name, category, quantity, value, alerted: false };
        } else {
            inventory.push({ id, name, category, quantity, value, alerted: false });
        }

        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory(inventory);
        elements.itemForm.reset();
        document.getElementById('item-id').value = '';
    });
}

function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-value').value = item.value;
        document.getElementById('item-creation')?.scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory(inventory);
}

if (elements.searchInput) {
    let timeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredItems = inventory.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.id.includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
            renderInventory(filteredItems);
        }, 300);
    });
}

function exportInventory() {
    if (!inventory.length) return showAlert('No data to export!');
    try {
        const csv = 'ID,Name,Category,Quantity,Value\n' +
            inventory.map(item => `${item.id},${item.name},${item.category},${item.quantity},${item.value}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_flow.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showAlert('Inventory exported successfully!');
    } catch (error) {
        console.error('Export failed:', error);
        showAlert('Failed to export inventory.');
    }
}

function resizeCanvas() {
    if (elements.canvas) {
        elements.canvas.width = window.innerWidth;
        elements.canvas.height = document.getElementById('dashboard')?.offsetHeight || 1000;
    }
}

if (elements.modeToggle) {
    elements.modeToggle.addEventListener('click', () => {
        if (elements.body.classList.contains('light-mode')) {
            elements.body.classList.replace('light-mode', 'dark-mode');
            elements.modeToggle.textContent = 'Light Mode';
            if (ctx) animateNebula();
        } else {
            elements.body.classList.replace('dark-mode', 'light-mode');
            elements.modeToggle.textContent = 'Dark Mode';
            particles = [];
        }
        updateHeatmap();
        updateChart();
        updateValueChart();
    });
}

if (elements.quickAddToggle && elements.quickAddForm) {
    elements.quickAddToggle.addEventListener('click', () => {
        elements.quickAddForm.style.display = elements.quickAddForm.style.display === 'block' ? 'none' : 'block';
    });

    elements.quickAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('quick-name')?.value.trim();
        const category = document.getElementById('quick-category')?.value.trim();
        const quantity = parseInt(document.getElementById('quick-quantity')?.value || 0);
        const value = parseFloat(document.getElementById('quick-value')?.value || 0);

        if (!name || !category || isNaN(quantity) || quantity < 0 || isNaN(value) || value < 0) {
            showAlert('Please fill all fields correctly!');
            return;
        }

        const id = String(inventory.length + 1).padStart(3, '0');
        inventory.push({ id, name, category, quantity, value, alerted: false });
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory(inventory);
        elements.quickAddForm.reset();
        elements.quickAddForm.style.display = 'none';
    });
}

if (elements.voiceBtn) {
    if (recognition) {
        recognition.onresult = (event) => {
            let transcript = event.results[0][0].transcript.trim();
            transcript = transcript.replace(/\.$/, '');
            transcript = transcript
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            if (transcript.toLowerCase().includes('add')) {
                const parts = transcript.toLowerCase().split('add')[1].trim().split(' ');
                const name = parts.slice(0, -2).join(' ');
                const quantity = parseInt(parts[parts.length - 2]);
                const category = parts[parts.length - 1];
                const value = parseFloat(prompt('Enter item value ($):') || 0);
                if (name && !isNaN(quantity) && category && !isNaN(value)) {
                    const id = String(inventory.length + 1).padStart(3, '0');
                    inventory.push({ 
                        id, 
                        name: name.charAt(0).toUpperCase() + name.slice(1), 
                        category: category.charAt(0).toUpperCase() + category.slice(1), 
                        quantity, 
                        value, 
                        alerted: false 
                    });
                    localStorage.setItem('inventory', JSON.stringify(inventory));
                    renderInventory(inventory);
                    showAlert(`Added: ${name} (${quantity}) to ${category}`);
                }
            } else {
                elements.searchInput.value = transcript;
                const filteredItems = inventory.filter(item =>
                    item.name.toLowerCase().includes(transcript.toLowerCase()) ||
                    item.id.includes(transcript) ||
                    item.category.toLowerCase().includes(transcript.toLowerCase())
                );
                renderInventory(filteredItems);
            }
        };

        elements.voiceBtn.addEventListener('click', () => recognition.start());
    } else {
        elements.voiceBtn.disabled = true;
        elements.voiceBtn.title = 'Voice recognition not supported in this browser';
    }
}

function showAlert(message) {
    if (!elements.alertsContainer) return;
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = `${message} <button class="dismiss-btn">✖</button>`;
    elements.alertsContainer.appendChild(alert);
    const timeout = setTimeout(() => alert.remove(), 5000);
    alert.querySelector('.dismiss-btn').addEventListener('click', () => {
        clearTimeout(timeout);
        alert.remove();
    });
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const rows = text.split('\n').slice(1).filter(row => row.trim());
            let added = 0;
            rows.forEach(row => {
                const [id, name, category, quantity, value] = row.split(',');
                if (id && name && category && !isNaN(quantity) && !isNaN(value)) {
                    inventory.push({
                        id: id.trim(),
                        name: name.trim(),
                        category: category.trim(),
                        quantity: parseInt(quantity),
                        value: parseFloat(value),
                        alerted: false
                    });
                    added++;
                }
            });
            localStorage.setItem('inventory', JSON.stringify(inventory));
            renderInventory(inventory);
            showAlert(`CSV imported successfully! ${added} items added.`);
        } catch (error) {
            console.error('CSV import error:', error);
            showAlert('Error importing CSV. Check file format (ID,Name,Category,Quantity,Value).');
        }
    };
    reader.readAsText(file);
}

function generatePDFReport() {
    if (!window.jspdf || !window.jspdf.jsPDF) return showAlert('jsPDF not loaded!');
    const { jsPDF } = window.jspdf;
    if (!jsPDF.prototype.autoTable) return showAlert('autoTable plugin not loaded!');
    const doc = new jsPDF();
    try {
        doc.setFontSize(40);
        doc.text('InventoryFlow Report', 20, 50);
        doc.setFontSize(16);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 80);
        doc.text(`Total Items: ${inventory.length}`, 20, 100);
        doc.text(`Low Stock: ${inventory.filter(i => i.quantity < 10).length}`, 20, 110);

        doc.addPage();
        doc.setFontSize(22);
        doc.text('Detailed Inventory', 20, 20);
        doc.autoTable({
            startY: 30,
            head: [['ID', 'Name', 'Category', 'Quantity', 'Value']],
            body: inventory.map(item => [item.id, item.name, item.category, item.quantity, `$${item.value}`]),
            theme: 'striped',
            headStyles: { fillColor: [74, 144, 226] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        doc.save('inventory_report.pdf');
        showAlert('PDF Report generated successfully!');
    } catch (error) {
        console.error('PDF generation error:', error);
        showAlert('Failed to generate PDF report.');
    }
}

window.addEventListener('load', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    resizeCanvas();
    renderInventory(inventory);
    if (elements.body.classList.contains('dark-mode') && ctx) animateNebula();
});

window.addEventListener('resize', resizeCanvas);

