<?php
//Job Portal Sprint 3 - GOOI YE FAN
//Rating page for candidates. Allows users to select a candidate, view their details, and submit a rating. Validates input and prevents duplicate ratings. Displays success or error messages based on the outcome of the rating submission.
//Final Version

$conn = new mysqli("localhost", "root", "", "jp3");
require_once 'rating_logic.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$message = "";
$selected_candidate_id = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $candidate_id = $_POST['candidate_id'] ?? "";
    $rating = $_POST['rating'] ?? "";
    $selected_candidate_id = $candidate_id;

    $result = processRating($conn, $candidate_id, $rating);

    if ($result["status"] === "success") {
        $message = "<div class='success'>{$result['message']}</div>";
    } else {
        $message = "<div class='error'>{$result['message']}</div>";
    }
}

// Fetch candidates after any update so ratings are fresh
$result = $conn->query("SELECT * FROM candidates");
?>

<!DOCTYPE html>
<html>
<head>
<title>Rate Candidate</title>
<style>
body {
    font-family: Arial;
    background: #f4f6f9;
}
.container {
    width: 420px;
    margin: 80px auto;
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
h2 { text-align: center; }

select, button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
}

.info {
    background: #eef;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
}

.stars {
    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
    margin: 15px 0;
}

.stars input {
    display: none;
}

.stars label {
    font-size: 28px;
    color: #ccc;
    cursor: pointer;
    padding: 5px;
}

.stars input:checked ~ label,
.stars label:hover,
.stars label:hover ~ label {
    color: gold;
}

.success { color: green; text-align: center; }
.error { color: red; text-align: center; }
</style>

<script>
function clearMessages() {
    const serverMessage = document.getElementById("server-message");
    const clientMessage = document.getElementById("client-message");

    if (serverMessage) {
        serverMessage.innerHTML = "";
    }

    if (clientMessage) {
        clientMessage.innerHTML = "";
    }
}

function showCandidateInfo() {
    let select = document.getElementById("candidate");
    let selected = select.options[select.selectedIndex];

    let name = selected.getAttribute("data-name");
    let email = selected.getAttribute("data-email");
    let skills = selected.getAttribute("data-skills");
    let rating = selected.getAttribute("data-rating");

    let infoBox = document.getElementById("info");

    if (name) {
        infoBox.innerHTML = 
            "<b>Name:</b> " + name + "<br>" +
            "<b>Email:</b> " + email + "<br>" +
            "<b>Skills:</b> " + skills + "<br>" +
            "<b>Current Rating:</b> " + (rating == 0 ? "Not rated" : rating + " ⭐");

        // Reset stars
        document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);

        // Set previous rating
        if (rating > 0) {
            let star = document.getElementById("star" + rating);
            if (star) star.checked = true;
        }
    } else {
        infoBox.innerHTML = "";
        document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    }

    clearMessages();
}

function validateForm() {
    const candidateSelect = document.getElementById("candidate");
    const candidate = candidateSelect.value;
    const selectedOption = candidateSelect.options[candidateSelect.selectedIndex];
    const currentRating = selectedOption ? selectedOption.getAttribute("data-rating") : "";
    const ratingSelected = document.querySelector('input[name="rating"]:checked');
    const messageBox = document.getElementById("client-message");

    if (!candidate) {
        messageBox.innerHTML = "<div class='error'>Please select a candidate.</div>";
        return false;
    }

    if (!ratingSelected) {
        messageBox.innerHTML = "<div class='error'>Please select a rating before submitting.</div>";
        return false;
    }

    if (currentRating !== null && currentRating !== "" && String(ratingSelected.value) === String(currentRating)) {
        messageBox.innerHTML = "<div class='error'>Latest rating is the same as previous rating. Please choose a different rating.</div>";
        return false;
    }

    messageBox.innerHTML = "";
    return true;
}

window.onload = function() {
    const selectedCandidateId = "<?= htmlspecialchars($selected_candidate_id, ENT_QUOTES, 'UTF-8') ?>";
    const ratingInputs = document.querySelectorAll('input[name="rating"]');

    ratingInputs.forEach(function(input) {
        input.addEventListener("change", clearMessages);
    });

    if (selectedCandidateId) {
        const candidateSelect = document.getElementById("candidate");
        candidateSelect.value = selectedCandidateId;
        showCandidateInfo();
    } else {
        showCandidateInfo();
    }
};
</script>

</head>
<body>

<div class="container">
<h2>Rate Candidate</h2>

<div id="server-message"><?php echo $message; ?></div>
<div id="client-message"></div>

<form method="POST" onsubmit="return validateForm()">

<select name="candidate_id" id="candidate" onchange="showCandidateInfo()">
    <option value="">-- Select Candidate --</option>
    <?php while($row = $result->fetch_assoc()): ?>
        <option value="<?= $row['id'] ?>"
            data-name="<?= $row['name'] ?>"
            data-email="<?= $row['email'] ?>"
            data-skills="<?= $row['skills'] ?>"
            data-rating="<?= $row['rating'] ?>">
            <?= $row['name'] ?>
        </option>
    <?php endwhile; ?>
</select>

<div id="info" class="info"></div>

<div class="stars">
    <input type="radio" name="rating" value="5" id="star5"><label for="star5">★</label>
    <input type="radio" name="rating" value="4" id="star4"><label for="star4">★</label>
    <input type="radio" name="rating" value="3" id="star3"><label for="star3">★</label>
    <input type="radio" name="rating" value="2" id="star2"><label for="star2">★</label>
    <input type="radio" name="rating" value="1" id="star1"><label for="star1">★</label>
</div>

<button type="submit">Submit Rating</button>

</form>
</div>

</body>
</html>