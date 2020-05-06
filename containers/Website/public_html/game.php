<?php
// Initialize the session
// if (!isset($_SESSION)) {
//     session_start();
// }
 
// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once 'config.php';

$loading = true;
$content =' ';
// while ($loading == true) {
//     sleep(1);
// }

// if ($loading != true) {
//     $content ='<iframe src="tic-tac-toe/build/index.html?token=1&gm=3000&pm=1337" width="100%" ></iframe>';
// }else{
//     $content =' ';
// }

// do{
//     $content =' ';
// }while ($loading);

// $content ='<iframe src="tic-tac-toe/build/index.html?token=1&gm=3000&pm=1337" width="100%" ></iframe>';

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
            Loading...
        </div>
        <?php include 'footer.php'; ?> 
    </body>
    <script type="text/javascript">
        $.ajax({
          url: 'load.php',
          success: function(data) {
              $('#content').html('<iframe src="tic-tac-toe/build/index.html?token=1&gm=3000&pm=1337" width="100%" ></iframe>');
            }
    });
</script>

</html>

