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

if (isset($_GET['game'])) {
    $game = $_GET['game'];
}else{
    header("location: portal.php");
}

$dest = 'gameLoading.php';
$practice = $dest.'?tournament=null&spectator=false&game='.$game;
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
            <div class="gameOptions row">
                <div class="column">
                    <h2>Participate</h2>
                    <div class="section">
                        <h3>One-Round</h3>
                        <button class="btn-new" onclick="window.location='<?php echo $practice ?>'">Practice Play</button>
                        <h3>Tournaments</h3>
                         <!-- <button class="btn-new" onclick="alert('Hello world!')">Practice Play</button> -->
                         <?php
                            // Show all tournaments in the database

                            $get_data = callAPI('GET', $gamemaster.'/tournament?game='.$game, false, $header);
                            $response = json_decode($get_data, false);
                            $response = json_decode($response, true) ;
       
                            if ($httpcode == 200) {
                                if (count($response) == 0) {
                                    echo 'No available plays found.';
                                }
                                foreach ($response as $tourn){ 
                                    $req = $dest.'?tournament='.strval($tourn["id"]).'&spectator=false&rounds='.$tourn['pop'].'&game='.$game;
                                    $text = $tourn['name'].'  [ '.$tourn['connected'].' / '.$tourn['pop'] . ' ]';
                                    // specify tournament variables
                                    echo '<button class="btn-new" onclick="window.location='."'".$req."'".'">'.$text.'</button>';

                                }
                            }else{
                                echo "Error";
                            }
                            ?>
                    </div>
                </div>
                <div class="column">
                    <h2>Spectate</h2>
                    <div class="section">
                        <?php
                            // Show all tournaments in the database
                            $get_data = callAPI('GET', $gamemaster.'/spectator?game='.$game, false, false);
                            $response = json_decode($get_data, true);
                            $response = json_decode($response, true) ;

                            if ($httpcode == 200) {
                                if (count($response) == 0) {
                                    echo 'No available plays found.';
                                }
                                foreach ($response as $round){ 
                                    $req = $dest.'?tournament=null&spectator=true&roundID='.$round['roundID'].'&game='.$game;;
                                    $text = join(" vs ",$round['players']);
                                    echo '<button class="btn-new" onclick="window.location='."'".$req."'".'">'.$text.'</button>';
                                }
                            }else{
                                echo "Error";
                            }
                        ?>
                    </div>
                </div>
                
            </div>
        </div>
        <?php include 'footer.php'; ?> 
    </body>
    <script type="text/javascript">
        setEqualHeight($('.section'));
    </script>
</html>

