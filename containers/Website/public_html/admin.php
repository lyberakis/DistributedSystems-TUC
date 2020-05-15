<?php
// Initialize the session

// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once 'config.php';
require_once 'functions.php';


 ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Game Dashboard</title>
    <?php include 'includes.php'; ?>
</head>
<body>
    <?php include 'menu.php'; ?>
    <div id="content" class="bg">
        <div class="container">
            <div class="buttonList">
            <button class="btn-new" onclick="window.location='editUser.php'">Edit users</button>
            <button class="btn-new" onclick="window.location='installGame.php'">Install Game</button>
            </div>
        </div>
    </div>
    <?php include 'footer.php'; ?> 
</body>
</html>