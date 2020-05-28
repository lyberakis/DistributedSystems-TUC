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

require_once "config.php";
require_once "functions.php";

// Show all student in the database
$header = array("Authorization: "." ".$_SESSION["token_type"]." ".$_SESSION["access_token"]);
$get_data = callAPI('GET', $gamemaster.'/scores/tournament/'.$_SESSION['token'], $data, false);
$response = json_decode($get_data, true);
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <?php include 'includes.php'; ?>
    </head>
    <body>
        <?php include 'menu.php'; ?>
        <div id="content" class="bg">
            <div class="container">
                <h1> Plays </h1>
                <div class="score_list">
                    <table>
                        <tr>
                            <th style="width: 40%"><strong>Game</strong></th>
                            <th style="width: 40%"><strong>Player 1</strong></th>
                            <th style="width: 40%"><strong>Player 2</strong></th>
                            <th style="width: 20%"><strong>Winner</strong></th>
                         </tr>
                    <?php
                    if ($httpcode == 200) {
                        foreach ($response['records'] as $scores){ 
                            echo "<tr>";
                                echo '<td style="width: 33%">'.$scores['game'].'</td>';
                                echo '<td style="width: 33%">'.$scores["players"][0].'</td>';
                                echo '<td style="width: 33%">'.$scores["players"][1].'</td>';
                                echo '<td style="width: 33%">'.$scores["winner"].'</td>';
                            echo "</tr>";                    
             
                        }
                    }elseif ($httpcode == 401) {
                        echo "<tr>";
                        echo '<td colspan="4" style="text-align: center;">Unauthorized action!</td>';
                        echo "</tr>";
                    }else{
                        echo "<tr>";
                        echo '<td colspan="4" style="text-align: center;">No records found...</td>';
                        echo "</tr>";
                    }
                    ?>
                    </table>
                </div>
            </div>
        </div>
    </body>
    <?php include 'footer.php'; ?> 
</html>