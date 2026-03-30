<?php

// Validate candidate and rating input
function validateInput($candidate_id, $rating) {
    if (empty($candidate_id)) {
        return "Please select a candidate.";
    }

    if (empty($rating)) {
        return "Please select a rating.";
    }

    return "valid";
}


// Check if candidate exists and get current rating
function getCurrentRating($conn, $candidate_id) {
    $candidate_id = mysqli_real_escape_string($conn, $candidate_id);

    $sql = "SELECT rating FROM candidates WHERE id='$candidate_id' LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        return (int) $result->fetch_assoc()['rating'];
    }

    return null; // candidate not found
}


// Check if new rating is same as current rating
function isSameRating($current_rating, $new_rating) {
    return (int)$current_rating === (int)$new_rating;
}


// Update candidate rating
function updateRating($conn, $candidate_id, $rating) {
    $candidate_id = mysqli_real_escape_string($conn, $candidate_id);
    $rating = (int)$rating;

    $sql = "UPDATE candidates SET rating='$rating' WHERE id='$candidate_id'";

    if ($conn->query($sql)) {
        return true;
    }

    return false;
}


// Main process function
function processRating($conn, $candidate_id, $rating) {

    // Step 1: Validate input
    $validation = validateInput($candidate_id, $rating);
    if ($validation !== "valid") {
        return ["status" => "error", "message" => $validation];
    }

    // Step 2: Get current rating
    $current_rating = getCurrentRating($conn, $candidate_id);

    if ($current_rating === null) {
        return ["status" => "error", "message" => "Candidate not found."];
    }

    // Step 3: Check duplicate rating
    if (isSameRating($current_rating, $rating)) {
        return [
            "status" => "error",
            "message" => "Latest rating is the same as previous rating. Please choose a different rating."
        ];
    }

    // Step 4: Update rating
    if (updateRating($conn, $candidate_id, $rating)) {
        return ["status" => "success", "message" => "Rating updated successfully!"];
    }

    return ["status" => "error", "message" => "Error updating rating."];
}