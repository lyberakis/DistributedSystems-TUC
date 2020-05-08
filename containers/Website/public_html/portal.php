<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
    $_SESSION["token"] = rand(0, 10005);
}
$_SESSION['gm'] = '';
$_SESSION['pm'] = '';
// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once 'config.php';


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
    
                <div class="item">
                    <a href="gameOptions.php?game=chess">
                        <img src="img/chess_icon.png">
                    </a>
                </div>

                <div class="item">
                    <a href="gameOptions.php?game=tic-tac-toe">
                        <img src="img/tic-tac-toe.png">
                    </a>
                </div>
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