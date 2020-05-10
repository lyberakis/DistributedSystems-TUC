<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}

// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once 'config.php';
$game = 'react-chess';
$content = '<div id="game_frame">
<iframe src="games/'.$_SESSION["game"].'/build/index.html?token='.$_SESSION["token"].'&gm='.$_SESSION["gm"].'&pm='.$_SESSION["pm"].'" width="100%" ></iframe> </div>';

 ?>


<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Game Dashboard</title>
        <?php include 'includes.php'; ?>
        <script src="js/pace.js"></script>
        <link href="css/pace.css" rel="stylesheet" />
    </head>
    <body>
        <?php include 'menu.php'; ?>
        <div id="content" class="bg">
            <?php echo $content; ?>
        </div>
        <?php include 'footer.php'; ?> 
    </body>
</html>
