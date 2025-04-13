<?php
session_start(); // Start the session


if (!isset($_SESSION['inventory'])) {
    $_SESSION['inventory'] = []; // Start with an empty inventory
}
print_r($_SESSION['inventory']); // Debugging line to check the inventory
// Handle API requests
header('Content-Type: text/plain'); // Set content type to plain text

// Add item
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'], $data['name'], $data['category'], $data['quantity'], $data['value'])) {
        foreach ($_SESSION['inventory'] as $item) {
            if ($item['id'] === $data['id']) {
                http_response_code(400);
                echo "Error: Item with this ID already exists";
                exit;
            }
        }
        $_SESSION['inventory'][] = [
            "id" => $data['id'],
            "name" => $data['name'],
            "category" => $data['category'],
            "quantity" => (int)$data['quantity'],
            "value" => (float)$data['value'],
            
        ];
        echo "Item added successfully";
    } else {
        http_response_code(400);
        echo "Error: Invalid data";
    }
    exit;
}

// Update item
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id'])) {
        foreach ($_SESSION['inventory'] as &$item) {
            if ($item['id'] === $data['id']) {
                $item['name'] = $data['name'] ?? $item['name'];
                $item['category'] = $data['category'] ?? $item['category'];
                $item['quantity'] = isset($data['quantity']) ? (int)$data['quantity'] : $item['quantity'];
                $item['value'] = isset($data['value']) ? (float)$data['value'] : $item['value'];
                $item['last_updated'] = time(); // Update the timestamp
                echo "Item updated successfully";
                exit;
            }
        }
        http_response_code(404);
        echo "Error: Item not found";
    } else {
        http_response_code(400);
        echo "Error: Invalid data";
    }
    exit;
}

// Fetch updated items
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['updated_since'])) {
        $updated_since = (int)$_GET['updated_since'];
        $filteredInventory = array_filter($_SESSION['inventory'], function ($item) use ($updated_since) {
            return isset($item['last_updated']) && $item['last_updated'] >= $updated_since;
        });

      
        if (!empty($filteredInventory)) {
            foreach ($filteredInventory as $item) {
                echo "ID: {$item['id']}, Name: {$item['name']}, Category: {$item['category']}, Quantity: {$item['quantity']}, Value: {$item['value']}\n";
            }
        } else {
            echo "No updated items found.";
        }
    } else {
        // Display all items in plain text
        foreach ($_SESSION['inventory'] as $item) {
            echo "ID: {$item['id']}, Name: {$item['name']}, Category: {$item['category']}, Quantity: {$item['quantity']}, Value: {$item['value']}\n";
        }
    }
    exit;
}
?>