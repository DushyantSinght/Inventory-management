<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "your_db_name";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$response = ["status" => "success", "message" => "Connected to phpMyAdmin successfully. "];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $fullname = $_POST['fullname'] ?? '';
    $email = $_POST['email'] ?? '';
    $username = $_POST['new-username'] ?? '';
    $password = $_POST['new-password'] ?? '';
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    if (!$fullname || !$email || !$username || !$password) {
        $response["status"] = "error";
        $response["message"] = "All fields are required.";
    } else {
        $sql = "INSERT INTO users (fullname, email, username, password) VALUES ('$fullname', '$email', '$username', '$hashedPassword')";
        if ($conn->query($sql) === TRUE) {
            $response["message"] .= "Signup successful!";
        } else {
            $response["status"] = "error";
            $response["message"] = "Signup failed: " . $conn->error;
        }
    }
}

echo json_encode($response);
$conn->close();
?>