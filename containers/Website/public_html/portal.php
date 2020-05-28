<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: index.php");
    exit;
}

require_once 'config.php';
require_once 'functions.php';
$_SESSION['gm'] = '';
$_SESSION['pm'] = '';
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
            <div class="games">
                <h1>Game List</h1>
                <?php
                // Show games dynamically
                    $games = getGames();
                    foreach($games as $game) {
                        echo '<div class="item">
                            <a href="gameOptions.php?game='.$game.'">
                                <img src="games/'.$game.'/icon.png">
                            </a>
                        </div>';
                    }
                ?>
            </div>
            
        </div>
    </div>
    <?php include 'footer.php'; ?> 
</body>
<script type="text/javascript">
    $(document).ready(function(){
         $('#myid').html(session_id());
    }
</script>
</html>