<?php
//The htmlspecialchars() function converts special characters to HTML entities. This means that it will replace HTML characters like < and > with &lt; and &gt;. This prevents attackers from exploiting the code by injecting HTML or Javascript code (Cross-site Scripting attacks) in forms.

$firstname_th = htmlspecialchars($_SESSION["firstname"]); //
$surname_th = htmlspecialchars($_SESSION["surname"]);
$id_th = htmlspecialchars($_SESSION["id"]);
$username_th = htmlspecialchars($_SESSION["username"]);
$email_th = htmlspecialchars($_SESSION["email"]);

?>
<div id="header">
    <ul class="topnav">
        <li><a class="active" href="portal.php">Board Games</a></li>
        <li><a href="scores.php">Scores</a></li>
        <li><a href="leaderboard.php">Leader Board</a></li>
        <li><a href="tournament.php">Official Panel</a></li>
        <li><a href="admin.php">Admin Panel</a></li>
        <li style="float:right" class="dropdown">
            <a class="dropbtn"><?php echo $firstname_th." ".$surname_th; ?></a>
            <div class="dropdown-content">
                <a href="logout.php" onclick="return ConfirmLogout()">logout</a>
            </div>
        </li>
    </ul>
</div>