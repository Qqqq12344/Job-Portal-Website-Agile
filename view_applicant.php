<?php 
include 'config.php'; 

// Check if a job has been selected from the dropdown
$selected_job = isset($_GET['job_id']) ? $_GET['job_id'] : 0;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Employer Portal</title>
    <style>
        body { font-family: sans-serif; background: #f4f7f6; padding: 20px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #4CAF50; color: white; }
        .dropdown-box { margin-bottom: 20px; padding: 15px; background: #e8f5e9; border-radius: 5px; }
        select { padding: 8px; width: 250px; border-radius: 4px; }
        .badge { padding: 5px 10px; border-radius: 15px; font-size: 12px; background: #eee; }
    </style>
</head>
<body>

<div class="card">
    <h2>Employer Dashboard: View Applicants</h2>

    <div class="dropdown-box">
        <form method="GET" action="">
            <label><strong>Select Job Posting:</strong></label>
            <select name="job_id" onchange="this.form.submit()">
                <option value="0">-- Select a Job --</option>
                <?php
                $job_list = $conn->query("SELECT * FROM jobs");
                while($job = $job_list->fetch_assoc()) {
                    $sel = ($selected_job == $job['job_id']) ? "selected" : "";
                    echo "<option value='{$job['job_id']}' $sel>{$job['job_title']}</option>";
                }
                ?>
            </select>
        </form>
    </div>

    <?php
    if ($selected_job > 0) {
        $sql = "SELECT * FROM applicants WHERE job_id = $selected_job";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            echo "<table>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                    </tr>";
            while($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>{$row['name']}</td>
                        <td>{$row['email']}</td>
                        <td>{$row['phone']}</td>
                        <td>{$row['application_date']}</td>
                        <td><span class='badge'>{$row['status']}</span></td>
                      </tr>";
            }
            echo "</table>";
        } else {
            echo "<p><strong>No applicants found</strong> for this specific job posting.</p>";
        }
    } else {
        echo "<p>Please select a job from the list to see candidates.</p>";
    }
    ?>
</div>

</body>
</html>
