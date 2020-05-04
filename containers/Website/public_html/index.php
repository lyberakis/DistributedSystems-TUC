<?php
// Initialize the session
if (!isset($_SESSION)) {
    session_start();
}
 
// Check if the user is already logged in, if yes then redirect him to welcome page
if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: portal.php");
    exit;
}
 
// Include config file
// require_once "config.php";
require_once "functions.php";    //containes the secure_input() function


// Define variables and initialize with empty values
$username = $password = "";
$err = "";
 
// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    // Check if username is empty, remove spaces.
    if(empty(trim($_POST["username"]))){
        $err = "Please enter username.";
    } else{
        $username = secure_input($_POST["username"]); 
    }
    
    // Check if password is empty
    if(empty(trim($_POST["password"]))){
        $err = "Please enter your password.";
    } else{
        $password = secure_input($_POST["password"]);
    }
    
    // Validate credentials
    if(empty($err)){
            $get_data = callAPI('GET', $db_service.'/api/teacher/'.$username, false, false);
            if ($get_data) {
                $response = json_decode($get_data, true); //When TRUE, returned objects will be converted into associative arrays

                // Check if username exists, if yes then verify password
                if($response['username']){                    
                    // password_verify($password, $hashed_password)
                    if(strcmp($password, $response['password']) == 0){
                        // Password is correct, so start a new session
                        session_start();
                                
                        // Store data in session variables
                        $_SESSION["type"] = "stdnet";
                        $_SESSION["loggedin"] = true;
                        $_SESSION["id"] = $response['id'];
                        $_SESSION["username"] = $response['username']; 
                        $_SESSION["firstname"] = $response['name']; 
                        $_SESSION["surname"] = $response['surname'];
                        $_SESSION["email"] = $response['email'];                       
                                
                        // Redirect user to welcome page
                        header("location: portal.php");
                    } else{
                    // Display an error message if password is not valid
                        $err = "The password you entered was not valid.";
                    }
                }else{
                    // Display an error message if username doesn't exist
                    $err = "No account found with that username.";
                }
            }else{
                $err = "Oops! Something went wrong. Please try again later.";
            } 
    }
    
    // Close connection
   mysqli_close($link);
}
?>
 
<!DOCTYPE html>
<html lang="en">
<head>
   <!-- Include the css style etc -->
    <?php include 'includes.php'; ?>   
    <title>Board Games</title>
</head>
<body>
    <div id="header">
        <ul class="topnav">
            <li><a class="active" href="#">Board Games</a></li>
            <li style="float:right">
                <button onclick="document.getElementById('id01').style.display='block'" style="width:auto;">Login</button>
            </li>
        </ul>
    </div>
    <div id="content" class="bg">

        <div id="id01" class="modal">
          
            <form class="modal-content animate" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <div class="imgcontainer">
                  <span onclick="document.getElementById('id01').style.display='none'" class="close" title="Close Modal">&times;</span>
                  <img src="img/img_avatar2.png" alt="Avatar" class="avatar">
                </div>

                <div class="container">
                  <label for="uname"><b>Username</b></label>
                  <input type="text" placeholder="Enter Username" name="uname" required>

                  <label for="psw"><b>Password</b></label>
                  <input type="password" placeholder="Enter Password" name="psw" required>
                    
                  <button type="submit">Login</button>
                  <!-- <label>
                    <input type="checkbox" checked="checked" name="remember"> Remember me
                  </label> -->
                </div>
            </form>
            <div class="help-block"><?php echo $err; ?></div>

        </div>
    </div>
    <?php include 'footer.php'; ?> 
    <script>
        // Get the modal
        var modal = document.getElementById('id01');

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    </script>   
</body>
</html>