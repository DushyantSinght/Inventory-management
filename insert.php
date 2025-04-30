<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "inventorydb";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Read values from POST
    $item_name = $_POST['item-name'] ?? '';
    $category = $_POST['item-category'] ?? '';
    $quantity = (int) ($_POST['item-quantity'] ?? 0);
    $value = (float) ($_POST['item-value'] ?? 0.00);
    $id = uniqid("INV");

    // Insert into database
    $stmt = $conn->prepare("INSERT INTO inventory (id, item_name, category, quantity, value) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("sssii", $id, $item_name, $category, $quantity, $value);

    if ($stmt->execute()) {
        echo "Item successfully connected to the database.";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method";
}
?>
