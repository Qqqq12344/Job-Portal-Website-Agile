<?php
$conn = new mysqli("localhost:3306", "root", "", "jobportal");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
