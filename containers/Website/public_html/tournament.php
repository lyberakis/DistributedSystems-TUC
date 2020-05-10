<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}
 
 // define variables and set to empty values
$message = "";
$game = $name =  $number = "";


// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once "config.php";
require_once "functions.php";

// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){
 
    //Check data for special characters
    $number = secure_input($_POST["number"]);
    $game = secure_input($_POST["game"]);
    $name = secure_input($_POST["name"]);

    //Input format validation
    if (!filter_var($number, FILTER_VALIDATE_INT) && ($number & ($number - 1)) == 0) {
        $message = '<span style="color:red">Number of player must be a power of two!</span>';
    }

    // Validate credentials
    if(empty($message)){
        $tourn = new stdClass();
        $tourn->game = $game ;
        $tourn->name = $name ;
        $tourn->players = $number ;

        $data = json_encode($tourn);
        $header = array("Content-Type:application/json");
        $get_data = callAPI('POST', $gamemaster.'/tournament', $data, $header);
        $response = json_decode($get_data, true);


        // Attempt to execute the prepared statement
        if($httpcode == 201){
            $message = '<span style="color:green">You added a tournament!</span>';

            //Erase fields for no resubmision
            $id = $name = $surname = $fathername =  $grade = $mobile_number = $birthday = "";
        }elseif ($httpcode == 401){
            $message = '<span style="color:red">Unauthorized action!</span>';
        }else{
            $message = '<span style="color:red">Oops! Something went wrong. Please try again later.</span>';
        }
    }
}

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <title>Game Dashboard</title>
    <?php include 'includes.php'; ?>
    <link href="css/grid-system.css" rel="stylesheet" type="text/css">
</head>
<body>
    <?php include 'menu.php'; ?>
    <div id="content" class="bg">
        <div class="container admin_form">
            <h1>Create Tournament</h1>
            <p>Please fill in the form.</p>
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <div class="row">
                    <div class="col-md-3">
                        <label for="name">Game</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="game" id="game" placeholder="tic-tac-toe" value="<?php echo $game; ?>" required>
                    </div>

                    <div class="col-md-3">
                        <label for="name">Name</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="name" id="name" placeholder="TIC 2020" value="<?php echo $name; ?>" required>
                    </div>

                    <div class="col-md-3">
                        <label for="surname">Number of players</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="number" id="number" placeholder="4" value="<?php echo $number; ?>" required> 
                    </div>

                    <div class="form-group">
                        <input type="submit" value="Sumbit">
                    </div>
                </div>
            </form>
            <div class="notifier"><?php echo $message; ?></div> 
        </div> 
    </div>
    <?php include 'footer.php'; ?> 
</body>

</html>