// Dummy data for demonstration
const dummyData = [
    { id: 'INV001', name: 'Laptop', category: 'Electronics', quantity: 15, value: 1200, status: 'In Stock' },
    { id: 'INV002', name: 'Desk Chair', category: 'Furniture', quantity: 8, value: 175, status: 'In Stock' },
    { id: 'INV003', name: 'Printer Paper', category: 'Office Supplies', quantity: 10, value: 12.99, status: 'In Stock' },
    { id: 'INV004', name: 'Coffee Maker', category: 'Kitchen', quantity: 6, value: 89.99, status: 'In Stock' },
    { id: 'INV005', name: 'Whiteboard', category: 'Office Supplies', quantity: 4, value: 45.50, status: 'Low Stock' },
    { id: 'INV006', name: 'Fasteners', category: 'Industrial Supplies', quantity: 10, value: 700.58, status: 'In Stock' },
    { id: 'INV007', name: 'Cement', category: 'Industrial Supplies', quantity: 20, value: 708.78, status: 'In Stock' },
    { id: 'INV008', name: 'Motherboard', category: 'Electronics', quantity: 0, value: 80.00, status: 'Out of Stock' },
    { id: 'INV009', name: 'Mouse', category: 'Electronics', quantity: 0, value: 200.00, status: 'Out of Stock' },
    { id: 'INV010', name: 'Slicer', category: 'Kitchen', quantity: 5, value: 400.80, status: 'Low Stock' },
    { id: 'INV013', name: 'Printer Cartridges', category: 'Office Supplies', quantity: 5, value: 120.00, status: 'Low Stock' }
];

// Initialize inventory from localStorage or use dummy data
let inventory = JSON.parse(localStorage.getItem('inventoryflow-data')) || dummyData;

// Initialize users from localStorage or empty array
let users = JSON.parse(localStorage.getItem('inventoryflow-users')) || [];

// Show alert with type (error/success)
function showAlert(message, type = 'info') {
    console.log(`showAlert: ${message}, type: ${type}`);
    const alertsContainer = document.getElementById('alerts');
    if (!alertsContainer) {
        console.error('Alerts container not found');
        return;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.zIndex = '2002';
    alertsContainer.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
}

// Add slideOut animation
const slideOutStyle = document.createElement('style');
slideOutStyle.innerHTML = `
    @keyframes slideOut {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    }
    .alert.fade-out {
        animation: slideOut 0.5s ease-out forwards;
    }
`;
document.head.appendChild(slideOutStyle);

// Page navigation functions
function showMainPage() {
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    document.getElementById('main-page').classList.add('active');
    console.log('Navigated to main page');
}

function showLoginPage() {
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    createParticles('login-particles');
}

function showSignupPage() {
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    document.getElementById('signup-page').classList.add('active');
    createParticles('signup-particles');
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventoryflow-data', JSON.stringify(inventory));
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('inventoryflow-users', JSON.stringify(users));
}

// Password strength validation
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
        return { isValid: false, message: 'Password must include uppercase, lowercase, numbers, and special characters.' };
    }
    return { isValid: true, message: 'Password is strong.' };
}

// Update product table
function updateProductTable() {
    console.log('Updating table with inventory:', inventory);
    const productTable = document.getElementById('product-table');
    if (!productTable) {
        console.error('Product table not found');
        showAlert('Product table not found', 'error');
        return;
    }

    let tableHTML = '';
    inventory.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${formatIndianCurrency(item.value)}</td>
                <td class="${item.status === 'Low Stock' ? 'text-red-500' : item.status === 'Out of Stock' ? 'text-gray-500' : 'text-green-500'}">${item.status}</td>
                <td>
                    <button class="bg-blue-500 text-white px-2 py-1 rounded mr-1 edit-btn" data-id="${item.id}">Edit</button>
                    <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `;
    });
    productTable.innerHTML = tableHTML || '<tr><td colspan="7">No items available</td></tr>';

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
                inventory = inventory.filter(i => i.id !== itemId);
                saveInventory();
                updateProductTable();
                updateStatsAndCharts();
                showAlert('Item deleted successfully!', 'success');
            }
        });
    });

    // Update dashboard stats
    document.querySelector('#total-items .count').textContent = inventory.length;
    document.querySelector('#low-stock .count').textContent = inventory.filter(item => item.status === 'Low Stock').length;
    document.querySelector('#out-of-stock .count').textContent = inventory.filter(item => item.status === 'Out of Stock').length;
    const categories = [...new Set(inventory.map(item => item.category))];
    document.querySelector('#categories .count').textContent = categories.length;
    const topItem = inventory.reduce((max, item) => item.quantity > max.quantity ? item : max, inventory[0] || { name: 'None', quantity: 0 });
    document.getElementById('top-item-name').textContent = topItem.name;
    document.getElementById('top-item-qty').textContent = topItem.quantity;

    // Low stock alerts
    inventory.forEach(item => {
        if (item.status === 'Low Stock') {
            showAlert(`Low stock alert: ${item.name} (Quantity: ${item.quantity})`, 'error');
        }
    });
}

// Update charts (minimal version for PDF compatibility)
function updateStatsAndCharts() {
    // Placeholder for chart updates (handled in enhanced-script.js if needed)
    console.log('Charts updated (placeholder)');
}

// Format number in Indian currency style
function formatIndianCurrency(value) {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(value);
}

// Export inventory as Excel
function exportInventory() {
    try {
        const worksheet = XLSX.utils.json_to_sheet(inventory.map(item => ({
            ID: item.id,
            Name: item.name,
            Category: item.category,
            Quantity: item.quantity,
            Value: formatIndianCurrency(item.value),
            Status: item.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
        XLSX.writeFile(workbook, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showAlert('Inventory exported successfully as Excel!', 'success');
    } catch (error) {
        showAlert(`Export failed: ${error.message}`, 'error');
    }
}

// Import CSV
function importCSV(event) {
    const file = event.target.files[0];
    if (!file) {
        showAlert('No file selected.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contents = e.target.result;
            const lines = contents.split('\n').map(line => line.split(','));
            const headers = lines[0];
            const newItems = lines.slice(1).map(line => ({
                id: line[0],
                name: line[1],
                category: line[2],
                quantity: parseInt(line[3]),
                value: parseFloat(line[4]),
                status: parseInt(line[3]) <= 5 ? 'Low Stock' : parseInt(line[3]) === 0 ? 'Out of Stock' : 'In Stock'
            }));

            inventory = [...inventory, ...newItems.filter(item => item.id && item.name && item.category && !isNaN(item.quantity) && !isNaN(item.value))];
            saveInventory();
            updateProductTable();
            updateStatsAndCharts();
            showAlert('CSV imported successfully!', 'success');
        } catch (error) {
            showAlert(`Error importing CSV: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

// PDF Generation Script
const loadPDFLibrary = async () => {
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.25/dist/jspdf.plugin.autotable.min.js');
        if (!window.jspdf) throw new Error('Primary CDN loaded but window.jspdf not defined');
        return true;
    } catch (error) {
        console.error('PDF library loading failed:', error);
        throw error;
    }
};

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Particle effect creator
function createParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;
    const isDarkMode = document.body.classList.contains('dark-mode');

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: isDarkMode ?
                `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.1})` :
                `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.3 + 0.1})`,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25
        });
    }

    function drawParticles() {
        if (!canvas.parentNode) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        requestAnimationFrame(drawParticles);
    }

    drawParticles();

    window.addEventListener('resize', () => {
        if (canvas.parentNode) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

// Main event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.replace('light-mode', 'dark-mode');
            modeToggle.textContent = 'Light Mode';
            localStorage.setItem('inventoryflow-theme', 'dark');
        } else {
            document.body.classList.replace('dark-mode', 'light-mode');
            modeToggle.textContent = 'Dark Mode';
            localStorage.setItem('inventoryflow-theme', 'light');
        }
    });

    const savedTheme = localStorage.getItem('inventoryflow-theme');
    if (savedTheme === 'dark') {
        document.body.classList.replace('light-mode', 'dark-mode');
        modeToggle.textContent = 'Light Mode';
    }

    // Quick add form toggle
    const quickAddToggle = document.getElementById('quick-add-toggle');
    const quickAddForm = document.getElementById('quick-add-form');
    quickAddToggle.addEventListener('click', () => {
        quickAddForm.style.display = quickAddForm.style.display === 'block' ? 'none' : 'block';
    });

    // Login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            showAlert('Please enter both username and password!', 'error');
            return;
        }

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('inventoryflow-user', username);
            showAlert('Login successful!', 'success');
            loginForm.reset();
            updateLoginButton();
            setTimeout(() => showMainPage(), 300); // Delay for alert visibility
        } else {
            showAlert('Invalid username or password.', 'error');
        }
    });

    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const termsCheck = document.getElementById('terms').checked;

        if (!fullname || !email || !username || !password || !confirmPassword) {
            showAlert('Please fill in all fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        if (!termsCheck) {
            showAlert('You must agree to the Terms of Service and Privacy Policy.', 'error');
            return;
        }

        if (users.some(u => u.username === username)) {
            showAlert('Username already exists. Please choose a different username.', 'error');
            return;
        }
        if (users.some(u => u.email === email)) {
            showAlert('Email already registered. Please use a different email.', 'error');
            return;
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            showAlert(passwordValidation.message, 'error');
            return;
        }

        const newUser = { fullname, email, username, password };
        users.push(newUser);
        saveUsers();
        showAlert('Signup successful! You can now log in.', 'success');
        signupForm.reset();
        setTimeout(() => showLoginPage(), 300); // Delay for alert visibility
    });

    // Forgot password
    const forgotPassword = document.getElementById('forgot-password');
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Enter your email to reset password:');
        if (email && users.some(u => u.email === email)) {
            showAlert(`Password reset instructions sent to ${email}.`, 'success');
        } else if (email) {
            showAlert('Email not found.', 'error');
        }
    });

    // Update login/logout button
    function updateLoginButton() {
        const loginBtn = document.getElementById('login-btn');
        const username = localStorage.getItem('inventoryflow-user');

        if (username && loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.classList.add('logout-btn');
            loginBtn.href = 'javascript:void(0)';
            loginBtn.onclick = function() {
                localStorage.removeItem('inventoryflow-user');
                showAlert('You have been logged out successfully!', 'success');
                loginBtn.textContent = 'Login';
                loginBtn.classList.remove('logout-btn');
                loginBtn.href = 'javascript:showLoginPage()';
                loginBtn.onclick = null;
            };
        }
    }

    updateLoginButton();

    // PDF generation (unchanged)
    document.getElementById('pdf-button').addEventListener('click', async function() {
        try {
            const spinner = document.getElementById('loading-spinner');
            spinner.style.display = 'flex';

            await loadPDFLibrary();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = pageWidth - 2 * margin;
            const lineHeight = 7;

            function addHeader(pageNumber, totalPages) {
                doc.setFillColor(0, 120, 215);
                doc.rect(0, 0, pageWidth, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('InventoryFlow', margin, 10);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text('Inventory Report', pageWidth - margin - 50, 10);
            }

            function addFooter(pageNumber, totalPages) {
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - margin, { align: 'center' });
                doc.text('© 2025 InventoryFlow. All rights reserved.', margin, pageHeight - margin);
            }

            doc.setFillColor(0, 120, 215);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(36);
            doc.text('InventoryFlow', pageWidth / 2, 80, { align: 'center' });
            doc.setFontSize(24);
            doc.text('Inventory Report', pageWidth / 2, 100, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`, pageWidth / 2, 120, { align: 'center' });
            doc.setFontSize(10);
            doc.text('© 2025 InventoryFlow. All rights reserved.', pageWidth / 2, pageHeight - margin, { align: 'center' });
            doc.addPage();

            let y = margin + 15;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Table of Contents', margin, y);
            y += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            const tocItems = [
                { text: '1. Executive Summary', page: 2 },
                { text: '2. Inventory Statistics', page: 2 },
                { text: '3. Inventory Items', page: 3 }
            ];
            tocItems.forEach(item => {
                y += lineHeight;
                doc.text(item.text, margin + 5, y);
                doc.text(`${item.page}`, pageWidth - margin - 10, y, { align: 'right' });
            });
            doc.addPage();

            y = margin + 15;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('1. Executive Summary', margin, y);
            y += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.text('This report provides a comprehensive overview of the current inventory managed by InventoryFlow.', margin, y, { maxWidth: contentWidth });
            y += lineHeight * 2;
            doc.text(`Total Items: ${inventory.length}`, margin, y);
            y += lineHeight;
            doc.text(`Low Stock Items: ${inventory.filter(item => item.quantity > 0 && item.quantity <= 5).length}`, margin, y);
            y += lineHeight;
            doc.text(`Out of Stock Items: ${inventory.filter(item => item.quantity === 0).length}`, margin, y);
            y += lineHeight;
            doc.text(`Categories: ${[...new Set(inventory.map(item => item.category))].length}`, margin, y);
            y += lineHeight * 2;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('2. Inventory Statistics', margin, y);
            y += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            const totalItems = inventory.length;
            const lowStockCount = inventory.filter(item => item.quantity > 0 && item.quantity <= 5).length;
            const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
            const categoriesCount = [...new Set(inventory.map(item => item.category))].length;
            const topItem = inventory.reduce((max, item) => item.quantity > max.quantity ? item : max, inventory[0] || { name: 'None', quantity: 0 });
            doc.setFillColor(240, 245, 255);
            doc.rect(margin, y, contentWidth, 40, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Items: ${totalItems}`, margin + 5, y + 10);
            doc.setTextColor(255, 99, 132);
            doc.text(`Low Stock: ${lowStockCount}`, margin + 5, y + 17);
            doc.setTextColor(0, 0, 0);
            doc.text(`Out of Stock: ${outOfStockCount}`, margin + 5, y + 24);
            doc.text(`Categories: ${categoriesCount}`, margin + 5, y + 31);
            doc.text(`Top Item: ${topItem.name} (Qty: ${topItem.quantity})`, margin + 5, y + 38);
            y += 50;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('3. Inventory Items', margin, y);
            y += lineHeight;
            const headers = ['ID', 'Name', 'Category', 'Quantity', 'Value', 'Status'];
            const rows = inventory.map(item => [
                item.id,
                item.name,
                item.category,
                item.quantity.toString(),
                formatIndianCurrency(item.value),
                item.status
            ]);
            if (rows.length) {
                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: y,
                    headStyles: { fillColor: [0, 120, 215], textColor: [255, 255, 255], fontSize: 10 },
                    bodyStyles: { fontSize: 9, cellPadding: 2 },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    tableLineColor: [0, 120, 215],
                    tableLineWidth: 0.1,
                    margin: { left: margin, right: margin },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 40 },
                        2: { cellWidth: 40 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 30 },
                        5: { cellWidth: 25 }
                    }
                });
            } else {
                doc.setFontSize(12);
                doc.text('No inventory items found.', margin, y);
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 2; i <= pageCount; i++) {
                doc.setPage(i);
                addHeader(i, pageCount);
                addFooter(i, pageCount);
            }

            showAlert('PDF report generated successfully!', 'success');
            doc.save(`inventoryflow_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            showAlert(`PDF generation failed: ${error.message}.`, 'error');
        } finally {
            document.getElementById('loading-spinner').style.display = 'none';
        }
    });

    // Initial table update
    updateProductTable();
});

// Page Navigation
window.showMainPage = showMainPage;
window.showLoginPage = showLoginPage;
window.showSignupPage = showSignupPage;