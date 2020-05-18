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
require_once "config.php";
require_once "functions.php";

// Show all student in the database
$header = array("Authorization: "." ".$_SESSION["token_type"]." ".$_SESSION["access_token"]);
$get_data = callAPI('GET', $gamemaster.'/scores/practice/'.$_SESSION['token'], $data, false);
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
                <h1> My Games </h1>
                <div class="score_list">
                    <table>
                        <tr>
                            <th style="width: 40%"><strong>Game</strong></th>
                            <th style="width: 40%"><strong>Opponent</strong></th>
                            <th style="width: 20%"><strong>Result</strong></th>
                         </tr>
                    <?php

                    if ($httpcode == 200) {
                        foreach ($response['personal'] as $myscores){ 
                            echo "<tr>";
                                echo '<td style="width: 33%">'.$myscores['game'].'</td>';
                                echo '<td style="width: 33%">'.$myscores["opponent"].'</td>';
                                echo '<td style="width: 33%">'.$myscores["result"].'</td>';
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

                <h1> Other players </h1>
                <div class="score_list">
                    <table>
                        <tr>
                            <th style="width: 40%"><strong>Game</strong></th>
                            <th style="width: 40%"><strong>User</strong></th>
                            <th style="width: 20%"><strong>Victories</strong></th>
                            <th style="width: 20%"><strong>Ties</strong></th>
                            <th style="width: 20%"><strong>Defeats</strong></th>
                         </tr>
                    <?php

                if ($httpcode == 200) {
                    foreach ($response['public'] as $public){ 
                        echo "<tr>";
                            echo '<td style="width: 20%">'.$public['game'].'</td>';
                            echo '<td style="width: 20%">'.$public["username"].'</td>';
                            echo '<td style="width: 20%">'.$public["victories"].'</td>';
                            echo '<td style="width: 20%">'.$public["ties"].'</td>';
                            echo '<td style="width: 20%">'.$public["defeats"].'</td>';
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