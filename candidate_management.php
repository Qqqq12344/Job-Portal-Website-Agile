<?php
include 'config1.php';

$message = "";

/* UPDATE STATUS */
if(isset($_POST['update_status']))
{
    $applicant_id = $_POST['applicant_id'];
    $status = $_POST['status'];

    $sql = "UPDATE applicants SET status='$status' WHERE applicant_id='$applicant_id'";

    if($conn->query($sql) === TRUE)
    {
        $message = "Application status updated successfully.";
    }
}

/* GET APPLICANTS */
$result = $conn->query("SELECT * FROM applicants");

?>

<!DOCTYPE html>
<html>
<head>
<title>Employer Candidate Management</title>

<style>

body{
font-family: Arial;
background:#f4f7f6;
padding:20px;
}

.card{
background:white;
padding:20px;
border-radius:10px;
box-shadow:0 4px 6px rgba(0,0,0,0.1);
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
padding:12px;
border-bottom:1px solid #ddd;
}

th{
background:#4CAF50;
color:white;
}

select{
padding:6px;
}

button{
background:#4CAF50;
color:white;
border:none;
padding:6px 12px;
border-radius:4px;
cursor:pointer;
}

.message{
background:#e8f5e9;
padding:10px;
margin-bottom:15px;
border-radius:5px;
}

.badge{
background:#eee;
padding:5px 10px;
border-radius:10px;
}

</style>

</head>

<body>

<div class="card">

<h2>Employer Candidate Management</h2>

<?php
if($message != "")
{
    echo "<div class='message'>$message</div>";
}
?>

<table>

<tr>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Application Date</th>
<th>Status</th>
<th>Update Status</th>
</tr>

<?php

while($row = $result->fetch_assoc())
{

echo "<tr>";

echo "<td>".$row['name']."</td>";
echo "<td>".$row['email']."</td>";
echo "<td>".$row['phone']."</td>";
echo "<td>".$row['application_date']."</td>";

echo "<td><span class='badge'>".$row['status']."</span></td>";

?>

<td>

<form method="POST">

<input type="hidden" name="applicant_id" value="<?php echo $row['applicant_id']; ?>">

<select name="status">

<option value="Pending">Pending</option>
<option value="Reviewed">Reviewed</option>
<option value="Shortlisted">Shortlisted</option>
<option value="Rejected">Rejected</option>
<option value="Hired">Hired</option>

</select>

<button type="submit" name="update_status">Update</button>

</form>

</td>

<?php

echo "</tr>";

}

?>

</table>

</div>

</body>
</html>