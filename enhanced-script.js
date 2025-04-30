document.addEventListener('DOMContentLoaded', () => {
    let inventory = JSON.parse(localStorage.getItem('inventoryflow-data')) || [];
    let history = JSON.parse(localStorage.getItem('inventoryflow-history')) || [];

    // Debugging logs
    console.log('InventoryFlow Dashboard: Loaded inventory:', inventory);
    console.log('InventoryFlow Dashboard: Loaded history:', history);

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

    // Save Inventory
    function saveInventory() {
        localStorage.setItem('inventoryflow-data', JSON.stringify(inventory));
    }

    // Save History
    function saveHistory() {
        localStorage.setItem('inventoryflow-history', JSON.stringify(history));
    }

    // Show Alert
    function showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alerts');
        if (!alertsContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        alertsContainer.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    }

    // Update Dashboard Stats
    function updateDashboardStats() {
        const totalItemsCount = document.getElementById('total-items-count');
        const lowStockCount = document.getElementById('low-stock-count');
        const outOfStockCount = document.getElementById('out-of-stock-count');
        const categoriesCount = document.getElementById('categories-count');

        if (!totalItemsCount || !lowStockCount || !outOfStockCount || !categoriesCount) {
            console.error('Dashboard stat elements not found.');
            return;
        }

        const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= 5);
        const outOfStockItems = inventory.filter(item => item.quantity === 0);
        const totalItems = inventory.length;
        const categories = [...new Set(inventory.map(item => item.category))];

        totalItemsCount.textContent = totalItems;
        lowStockCount.textContent = lowStockItems.length;
        outOfStockCount.textContent = outOfStockItems.length;
        categoriesCount.textContent = categories.length;

        totalItemsCount.dataset.target = totalItems;
        lowStockCount.dataset.target = lowStockItems.length;
        outOfStockCount.dataset.target = outOfStockItems.length;
        categoriesCount.dataset.target = categories.length;
    }

    // Enhanced Inventory Insights
    function updateEnhancedCharts() {
        // Category vs Quantity (Bar Chart)
        const categoryChart = document.getElementById('category-chart')?.getContext('2d');
        if (categoryChart) {
            if (window.categoryChart) window.categoryChart.destroy();
            const categories = [...new Set(inventory.map(item => item.category))];
            const categoryQuantities = categories.map(cat => 
                inventory.filter(item => item.category === cat).reduce((sum, item) => sum + item.quantity, 0)
            );

            window.categoryChart = new Chart(categoryChart, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Total Quantity',
                        data: categoryQuantities,
                        backgroundColor: 'rgba(74, 144, 226, 0.7)', // Blue
                        borderColor: 'rgba(74, 144, 226, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        title: { display: true, text: 'Categories vs Quantity', font: { size: 16 } }
                    }
                }
            });
        }

        // Items vs Value (Donut Chart)
        const valueDonutChart = document.getElementById('value-donut-chart')?.getContext('2d');
        if (valueDonutChart) {
            if (window.valueDonutChart) window.valueDonutChart.destroy();
            window.valueDonutChart = new Chart(valueDonutChart, {
                type: 'doughnut',
                data: {
                    labels: inventory.map(item => item.name),
                    datasets: [{
                        label: 'Total Value (₹)',
                        data: inventory.map(item => item.quantity * item.value),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '50%', // Makes it a donut chart
                    plugins: {
                        title: { display: true, text: 'Items vs Total Value (₹)', font: { size: 16 } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += formatIndianCurrency(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Quantity Over Time (Line Chart)
        const lineChart = document.getElementById('line-chart')?.getContext('2d');
        if (lineChart) {
            if (window.lineChart) window.lineChart.destroy();
            const timestamps = history.map(event => new Date(event.timestamp).toLocaleDateString());
            const quantities = history.map(event => event.item.quantity);
            window.lineChart = new Chart(lineChart, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Quantity Over Time',
                        data: quantities,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        title: { display: true, text: 'Quantity Over Time', font: { size: 16 } }
                    }
                }
            });
        }

        // Item vs Quantity (Bar Chart)
        const quantityChart = document.getElementById('quantity-chart')?.getContext('2d');
        if (quantityChart) {
            if (window.quantityChart) window.quantityChart.destroy();
            window.quantityChart = new Chart(quantityChart, {
                type: 'bar',
                data: {
                    labels: inventory.map(item => item.name),
                    datasets: [{
                        label: 'Quantity',
                        data: inventory.map(item => item.quantity),
                        backgroundColor: 'rgba(255, 99, 132, 0.7)', // Red
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        title: { display: true, text: 'Items vs Quantity', font: { size: 16 } }
                    }
                }
            });
        }
    }

    // Product Universe Filters
    function setupProductFilters() {
        const filterControls = document.querySelector('.filter-controls');
        if (!filterControls) return;

        const categories = [...new Set(inventory.map(item => item.category))];
        const categorySelect = document.createElement('select');
        categorySelect.className = 'filter-btn';
        categorySelect.innerHTML = '<option value="">All Categories</option>' + 
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        const statusSelect = document.createElement('select');
        statusSelect.className = 'filter-btn';
        statusSelect.innerHTML = `
            <option value="">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
        `;

        filterControls.append(categorySelect, statusSelect);

        function applyFilters() {
            const selectedCategory = categorySelect.value;
            const selectedStatus = statusSelect.value;
            let filteredInventory = inventory;

            if (selectedCategory) {
                filteredInventory = filteredInventory.filter(item => item.category === selectedCategory);
            }

            if (selectedStatus) {
                filteredInventory = filteredInventory.filter(item => 
                    selectedStatus === 'Out of Stock' ? item.quantity === 0 :
                    selectedStatus === 'Low Stock' ? item.quantity <= 5 && item.quantity > 0 :
                    selectedStatus === 'In Stock' ? item.quantity > 5 : true
                );
            }

            updateFilteredTable(filteredInventory);
        }

        categorySelect.addEventListener('change', applyFilters);
        statusSelect.addEventListener('change', applyFilters);
    }

    function updateFilteredTable(filteredInventory) {
        const productTable = document.getElementById('product-table');
        if (!productTable) return;

        let tableHTML = '';
        filteredInventory.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${formatIndianCurrency(item.value)}</td>
                    <td class="${item.quantity === 0 ? 'text-red-500' : item.quantity <= 5 ? 'text-yellow-500' : 'text-green-500'}">
                        ${item.quantity === 0 ? 'Out of Stock' : item.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                    </td>
                    <td>
                        <button class="bg-blue-500 text-white px-2 py-1 rounded mr-1 edit-btn" data-id="${item.id}">Edit</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-id="${item.id}">Delete</button>
                    </td>
                </tr>
            `;
        });
        productTable.innerHTML = tableHTML || '<tr><td colspan="7">No items match the filters.</td></tr>';

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                const item = inventory.find(i => i.id === itemId);
                if (item) {
                    document.getElementById('item-id').value = item.id;
                    document.getElementById('item-name').value = item.name;
                    document.getElementById('item-category').value = item.category;
                    document.getElementById('item-quantity').value = item.quantity;
                    document.getElementById('item-value').value = item.value;
                    document.getElementById('item-creation').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                if (confirm(`Are you sure you want to delete item ${itemId}?`)) {
                    const deletedItem = inventory.find(i => i.id === itemId);
                    inventory = inventory.filter(i => i.id !== itemId);
                    history.push({
                        timestamp: new Date().toISOString(),
                        action: 'Delete',
                        item: deletedItem || {}
                    });
                    saveInventory();
                    saveHistory();
                    updateProductTable();
                    updateEnhancedCharts();
                    updateDashboardStats();
                    showAlert('Item deleted successfully!', 'success');
                }
            });
        });
    }

    // Enhanced Voice Commands
    function setupVoiceCommands() {
        const voiceBtn = document.getElementById('voice-btn');
        if (!voiceBtn) {
            console.error('Voice button not found.');
            showAlert('Voice button not found.', 'error');
            return;
        }

        async function checkMicrophone() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                return true;
            } catch (error) {
                showAlert('Unable to access microphone.', 'error');
                return false;
            }
        }

        async function testMicrophone() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                let hasAudio = false;

                for (let i = 0; i < 50; i++) {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                    if (average > 10) {
                        hasAudio = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                stream.getTracks().forEach(track => track.stop());
                audioContext.close();

                if (hasAudio) return true;
                showAlert('Microphone test failed: No audio detected.', 'error');
                return false;
            } catch (error) {
                showAlert('Microphone test failed.', 'error');
                return false;
            }
        }

        voiceBtn.addEventListener('click', async () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                showAlert('Voice commands not supported in this browser.', 'error');
                return;
            }

            const micAvailable = await checkMicrophone();
            if (!micAvailable) return;

            const audioDetected = await testMicrophone();
            if (!audioDetected) return;

            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.timeout = 10000;

            let retryCount = 0;
            const maxRetries = 2;

            function startRecognition() {
                try {
                    recognition.start();
                    voiceBtn.style.background = 'red';
                    voiceBtn.setAttribute('aria-label', 'Recording voice command');
                } catch (error) {
                    showAlert(`Failed to start voice recognition: ${error.message}`, 'error');
                    voiceBtn.style.background = '';
                    voiceBtn.setAttribute('aria-label', 'Voice command');
                }
            }

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                showAlert(`Heard: "${transcript}"`, 'info');

                if (transcript.includes('add item')) {
                    const match = transcript.match(/add item ([\w\s]+) ([\w\s]+) (\d+) (\d+\.?\d*)/);
                    if (match) {
                        const [, name, category, quantity, value] = match;
                        const trimmedName = name.trim();
                        const trimmedCategory = category.trim();
                        const id = `INV${String(inventory.length + 1).padStart(3, '0')}`;
                        const status = parseInt(quantity) <= 5 ? 'Low Stock' : parseInt(quantity) === 0 ? 'Out of Stock' : 'In Stock';
                        const item = { id, name: trimmedName, category: trimmedCategory, quantity: parseInt(quantity), value: parseFloat(value), status };
                        inventory.push(item);
                        history.push({ timestamp: new Date().toISOString(), action: 'Add', item });
                        saveInventory();
                        saveHistory();
                        updateProductTable();
                        updateEnhancedCharts();
                        updateDashboardStats();
                        showAlert(`Item "${trimmedName}" added via voice command!`, 'success');
                    } else {
                        showAlert('Invalid format. Say: "add item [name] [category] [quantity] [value]"', 'error');
                    }
                } else if (transcript.includes('search')) {
                    const searchInput = document.getElementById('search');
                    if (searchInput) {
                        const searchTerm = transcript.replace('search', '').trim();
                        searchInput.value = searchTerm;
                        filterProducts();
                        showAlert(`Searching for "${searchTerm}"`, 'success');
                    } else {
                        showAlert('Search commands require a search input.', 'error');
                    }
                } else if (transcript.includes('filter by category')) {
                    const categorySelect = document.querySelector('.filter-controls select:first-child');
                    if (categorySelect) {
                        const category = transcript.replace('filter by category', '').trim();
                        if (categorySelect.querySelector(`option[value="${category}"]`)) {
                            categorySelect.value = category;
                            applyFilters();
                            showAlert(`Filtered by category: ${category}`, 'success');
                        } else {
                            showAlert(`Category "${category}" not found.`, 'error');
                        }
                    } else {
                        showAlert('Filter commands require filter controls.', 'error');
                    }
                } else if (transcript.includes('filter by status')) {
                    const statusSelect = document.querySelector('.filter-controls select:last-child');
                    if (statusSelect) {
                        const status = transcript.replace('filter by status', '').trim();
                        if (statusSelect.querySelector(`option[value="${status}"]`)) {
                            statusSelect.value = status;
                            applyFilters();
                            showAlert(`Filtered by status: ${status}`, 'success');
                        } else {
                            showAlert(`Status "${status}" not found.`, 'error');
                        }
                    } else {
                        showAlert('Filter commands require filter controls.', 'error');
                    }
                } else {
                    showAlert('Command not recognized.', 'error');
                }

                voiceBtn.style.background = '';
                voiceBtn.setAttribute('aria-label', 'Voice command');
            };

            recognition.onend = () => {
                voiceBtn.style.background = '';
                voiceBtn.setAttribute('aria-label', 'Voice command');
            };

            recognition.onerror = (event) => {
                let errorMessage = 'An error occurred during voice recognition.';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not detected.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied.';
                        break;
                    case 'network':
                        errorMessage = 'Network error.';
                        break;
                    case 'aborted':
                        if (retryCount < maxRetries) {
                            retryCount++;
                            setTimeout(startRecognition, 500);
                            return;
                        }
                        errorMessage = 'Speech recognition aborted after retries.';
                        break;
                    case 'language-not-supported':
                        errorMessage = 'Language not supported.';
                        break;
                    default:
                        errorMessage = `Voice recognition error: ${event.error}.`;
                }
                showAlert(errorMessage, 'error');
                voiceBtn.style.background = '';
                voiceBtn.setAttribute('aria-label', 'Voice command');
            };

            startRecognition();
        });
    }

    // Override updateProductTable
    window.updateProductTable = function() {
        updateFilteredTable(inventory);
    };

    // Item creation form submission
    const itemForm = document.getElementById('item-creation-form');
    if (itemForm) {
        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('item-id').value || `INV${String(inventory.length + 1).padStart(3, '0')}`;
            const name = document.getElementById('item-name').value.trim();
            const category = document.getElementById('item-category').value.trim();
            const quantity = parseInt(document.getElementById('item-quantity').value);
            const value = parseFloat(document.getElementById('item-value').value);
            const status = quantity === 0 ? 'Out of Stock' : quantity <= 5 ? 'Low Stock' : 'In Stock';

            if (!name || !category || isNaN(quantity) || isNaN(value) || quantity < 0 || value < 0) {
                showAlert('Please fill in all fields correctly with valid values.', 'error');
                return;
            }

            const existingItemIndex = inventory.findIndex(i => i.id === id);
            const item = { id, name, category, quantity, value, status };
            if (existingItemIndex >= 0) {
                inventory[existingItemIndex] = item;
                history.push({ timestamp: new Date().toISOString(), action: 'Update', item });
                showAlert('Item updated successfully!', 'success');
            } else {
                inventory.push(item);
                history.push({ timestamp: new Date().toISOString(), action: 'Add', item });
                showAlert('Item added successfully!', 'success');
            }

            saveInventory();
            saveHistory();
            updateProductTable();
            updateEnhancedCharts();
            updateDashboardStats();
            itemForm.reset();
            document.getElementById('item-id').value = '';
        });
    }

    // Quick add form submission
    const quickAddForm = document.getElementById('quick-add-form');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('quick-name').value.trim();
            const category = document.getElementById('quick-category').value.trim();
            const quantity = parseInt(document.getElementById('quick-quantity').value);
            const value = parseFloat(document.getElementById('quick-value').value);
            const id = `INV${String(inventory.length + 1).padStart(3, '0')}`;
            const status = quantity === 0 ? 'Out of Stock' : quantity <= 5 ? 'Low Stock' : 'In Stock';

            if (!name || !category || isNaN(quantity) || isNaN(value) || quantity < 0 || value < 0) {
                showAlert('Please fill in all fields correctly with valid values.', 'error');
                return;
            }

            const item = { id, name, category, quantity, value, status };
            inventory.push(item);
            history.push({ timestamp: new Date().toISOString(), action: 'Add', item });
            saveInventory();
            saveHistory();
            updateProductTable();
            updateEnhancedCharts();
            updateDashboardStats();
            quickAddForm.reset();
            quickAddForm.style.display = 'none';
            showAlert('Item added successfully!', 'success');
        });
    }

    // Search Functionality
    function filterProducts() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const filteredInventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.category.toLowerCase().includes(searchTerm) || 
            item.id.toLowerCase().includes(searchTerm)
        );
        updateFilteredTable(filteredInventory);
    }

    document.getElementById('search')?.addEventListener('input', filterProducts);

    // Initialize
    setupProductFilters();
    setupVoiceCommands();
    updateEnhancedCharts();
    updateProductTable();
    updateDashboardStats();
});

document.getElementById('item-creation-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('insert.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.text();

        // ✅ Show PHP message in alert box
        alert(result); // Shows: "Item successfully connected to the database."

        form.reset();
    } catch (err) {
        alert("❌ Failed to connect: " + err.message);
    }
});
