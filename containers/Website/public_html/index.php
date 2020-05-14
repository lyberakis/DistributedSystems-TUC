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
$usernameL = $passwordL = "";
$username = $password = $password2 = $email = "";
$err = "";
 
// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    if ($_POST["function"] == 'login') {
     
        // Check if username is empty, remove spaces.
        if(empty(trim($_POST["username"]))){
            $err = "Please enter username.";
        } else{
            $usernameL = secure_input($_POST["username"]); 
        }
        
        // Check if password is empty
        if(empty(trim($_POST["password"]))){
            $err = "Please enter your password.";
        } else{
            $passwordL = secure_input($_POST["password"]);
        }
        
        // Validate credentials
        if(empty($err)){
                $get_data = callAPI('GET', $db_service.'/user/'.$usernameL, false, false);
                if ($get_data) {
                    $response = json_decode($get_data, true); //When TRUE, returned objects will be converted into associative arrays

                    // Check if username exists, if yes then verify password
                    if($response['username']){                    
                        // password_verify($password, $hashed_password)
                        if(strcmp($passwordL, $response['password']) == 0){
                            // Password is correct, so start a new session
                            session_start();
                                    
                            // Store data in session variables
                            $_SESSION["role"] = $response['role'];
                            $_SESSION["loggedin"] = true;
                            $_SESSION["token"] = $response['token'];
                            $_SESSION["username"] = $response['username']; 
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
    }else if ($_POST["function"] == 'singup'){
        // Check if password is empty.
        if(empty($_POST["password"]) && $_POST["password"] != $_POST["password2"]){
            $err = "Passwords must be the same";
        } else{
            $password = secure_input($_POST["password"]); 
        }

        if(empty(trim($_POST["username"]))){
            $err = "Please enter username.";
        } else{
            $username = secure_input($_POST["username"]); 
        }
        
        // Check if email is empty
        if(empty(trim($_POST["email"]))){
            $err = "Please enter your email.";
        } else{
            $password = secure_input($_POST["email"]);
        }

        if(empty($err)){
            $user = new stdClass();
            $user->username = $username ;
            $user->password = $password ;
            $user->email = $email;

            $data = json_encode($user);
            // $header = array();
            $get_data = callAPI('POST', $db_service.'/user/', $data, false);
            $response = json_decode($get_data, true);


            if($httpcode == 201){
                $message = '<span style="color:green">User created!</span>';

                //Erase fields for no resubmision
                $username = $email = $password2 = $password;
            }elseif ($httpcode == 401){
                $message = '<span style="color:red">Username exists</span>';
            }else{
                $message = '<span style="color:red">Oops! Something went wrong. Please try again later.</span>';
            }
        }
    }
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
                <button onclick="document.getElementById('id02').style.display='block'" style="width:auto;">Sing up</button>
            </li>
            <li style="float:right">
                <button onclick="document.getElementById('id01').style.display='block'" style="width:auto;">Login</button>
            </li>
        </ul>
    </div>
    <div id="content" class="bg">
        <!-- LOGIN FORM -->
        <div id="id01" class="modal">
          
            <form class="modal-content animate" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <input type="hidden" type="text" name="function" value="login">
                <div class="imgcontainer">
                  <span onclick="document.getElementById('id01').style.display='none'" class="close" title="Close Modal">&times;</span>
                  <img src="img/img_avatar2.png" alt="Avatar" class="avatar">
                </div>

                <div class="container">
                  <label for="username"><b>Username</b></label>
                  <input type="text" placeholder="Enter Username" name="username" required>

                  <label for="password"><b>Password</b></label>
                  <input type="password" placeholder="Enter Password" name="password" required>
                    
                  <button type="submit">Login</button>
                  <!-- <label>
                    <input type="checkbox" checked="checked" name="remember"> Remember me
                  </label> -->
                </div>
            </form>
            <div class="help-block"><?php echo $err; ?></div>

        </div>

        <!-- SING UP FORM -->
        <div id="id02" class="modal">
          
            <form class="modal-content animate" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                <input type="hidden" type="text" name="function" value="singup">
                <div class="imgcontainer">
                  <span onclick="document.getElementById('id02').style.display='none'" class="close" title="Close Modal">&times;</span>
                </div>

                <div class="container">
                    <h1>Sign Up</h1>
                    <p>Please fill in this form to create an account.</p>
                    <hr>       
                    <label for="username"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="username" required>
                    <label for="email"><b>Email</b></label>
                    <input type="text" placeholder="Enter Email" name="email" required>

                    <label for="psw"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="psw" required>

                    <label for="password2"><b>Repeat Password</b></label>
                    <input type="password" placeholder="Repeat Password" name="password2" required>
                    <p>By creating an account you agree to our Terms & Privacy.</p>
                    
                    <button type="submit">Sing up</button>
                  <!-- <label>
                    <input type="checkbox" checked="checked" name="remember"> Remember me
                  </label> -->
                </div>
            </form>
            <div class="help-block"><?php echo $err; ?></div>

        </div>
        <div class="help-block"><?php echo $err; ?></div>
    </div>
    <?php include 'footer.php'; ?> 
    <script>
        // Get the modal
        var modal2 = document.getElementById('id01');
        var modal1 = document.getElementById('id02');

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal1) {
                modal1.style.display = "none";
            }else if (event.target == modal2) {
                modal2.style.display = "none";
            }
        }
    </script>   
</body>
</html>