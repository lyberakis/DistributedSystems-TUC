<?php

$myusername= htmlspecialchars($_SESSION["username"]);

?>
<div id="header">
    <ul class="topnav">
        <li><a class="active" href="portal.php">Board Games</a></li>
        <li class="dropdown"><a class="dropbtn">Scores</a>
            <div class="dropdown-content">
                <a href="practiceScores.php">Practice</a>
                <a href="tournamentScores.php">Tournament</a>
            </div>
        </li>
        <?php
        if ($_SESSION["role"] == 'official' || $_SESSION["role"] == 'admin') {
            echo "<li><a href='tournament.php'>Official Panel</a></li>";
        }
        if ($_SESSION["role"] == 'admin') {
            echo "<li><a href='admin.php'>Admin Panel</a></li>";
        }  ?>
        <li style="float:right" class="dropdown">
            <a class="dropbtn"><?php echo $myusername; ?></a>
            <div class="dropdown-content">
                <a href="logout.php" onclick="return ConfirmLogout()">logout</a>
            </div>
        </li>
    </ul>
</div>