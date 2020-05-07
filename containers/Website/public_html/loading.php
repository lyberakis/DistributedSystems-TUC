<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}

require_once 'config.php';

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
        </div>
        <?php include 'footer.php'; ?> 
    </body>
    <script type="text/javascript">
        $('#myid').html(session_id());
        $.ajax({
            url: 'load.php?id='+session_id(),
            success: function(data) {
                window.location.replace("game.php");   
            }
        })
        
    </script>

</html>

