<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}
 
 // define variables and set to empty values
$message = "";
$id = $game = $number = "";


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
    $id = secure_input($_POST["id"]);
    $name = secure_input($_POST["name"]);
    $surname = secure_input($_POST["surname"]);
    $fathername = secure_input($_POST["fathername"]);
    $grade = (real)$_POST["grade"];
    $mobile_number = secure_input($_POST["mobile_number"]);
    $birthday = secure_input($_POST["birthday"]);

    
    //Input format validation
 
    // check if name only contains letters
    if (!preg_match("/^[a-zA-Z]*$/",$name) or !preg_match("/^[a-zA-Z]*$/",$surname) or !preg_match("/^[a-zA-Z]*$/",$fathername)) {
        $message = '<span style="color:red">Only letters are allowed to names!</span>';
    }

    if (!filter_var($grade, FILTER_VALIDATE_FLOAT)) {
        $message = '<span style="color:red">Only number are allowed to grade!</span>';
    }

    if (!filter_var($mobile_number, FILTER_VALIDATE_INT)) {
        $message = '<span style="color:red">Invalid mobile number!</span>';
    }

    
    // Validate credentials
    if(empty($message)){

        // Prepare a select statement
        $sql = "INSERT INTO Students (ID, NAME, SURNAME, FATHERNAME, GRADE, MOBILENUMBER, Birthday)
        VALUES (?,?,?,?,?,?,?)";

        /* create a prepared statement */
        if($stmt = mysqli_prepare($link, $sql)){

            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "sssssss", $param_id, $param_name, $param_surname, $param_fathername, $param_grade, $param_mobile_number, $param_birthday);
            
            // Set parameters
            $param_id = $id;
            $param_name = $name;
            $param_surname = $surname;
            $param_fathername = $fathername;
            $param_grade = $grade;
            $param_mobile_number = $mobile_number;
            $param_birthday = $birthday;

            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                $message = '<span style="color:green">You added a student!</span>';
                
                //Update the history records
                $added_students = $_SESSION["array_record"];
                $p = $_SESSION["array_pointer"];
                $added_students[$p] = array($id, $name, $surname);
                $p++;
                $_SESSION["array_pointer"] = $p;
                $_SESSION["array_record"] = $added_students;

                //Erase fields for no resubmision
                $id = $name = $surname = $fathername =  $grade = $mobile_number = $birthday = "";
            }else{
                $message = '<span style="color:red">Oops! Something went wrong. Please try again later.</span>';
            }
        }
        
        // Close statement
        mysqli_stmt_close($stmt);
    }
    // Close connection
    mysqli_close($link);
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
                        <label for="id">ID</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="id" id="id" placeholder="1234" value="<?php echo $id; ?>" required>
                    </div>

                    <div class="col-md-3">
                        <label for="name">Game</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="name" id="name" placeholder="Kostas" value="<?php echo $game; ?>" required>
                    </div>

                    <div class="col-md-3">
                        <label for="surname">Number of players</label>
                    </div>
                    <div class="col-md-9">
                        <input type="text" name="surname" id="surname" placeholder="Kostopoulos" value="<?php echo $number; ?>" required> 
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