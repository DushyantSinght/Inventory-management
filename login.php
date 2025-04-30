<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "invemtorydb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$response = ["status" => "success", "message" => "Connected to phpMyAdmin successfully. "];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST['login-username'] ?? '';
    $password = $_POST['login-password'] ?? '';
    $logStatus = 'Failed';

    if (!$username || !$password) {
        $response["status"] = "error";
        $response["message"] = "Username and password required.";
    } else {
        $sql = "SELECT * FROM users WHERE username = '$username'";
        $result = $conn->query($sql);
        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            if (password_verify($password, $row['password'])) {
                $logStatus = 'Success';
                $response["message"] .= "Login successful!";
            } else {
                $response["status"] = "error";
                $response["message"] = "Incorrect password.";
            }
        } else {
            $response["status"] = "error";
            $response["message"] = "User not found.";
        }
    }
    $conn->query("INSERT INTO auth_logs (username, status) VALUES ('$username', '$logStatus')");
}

echo json_encode($response);
$conn->close();
?>