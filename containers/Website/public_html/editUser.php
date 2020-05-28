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
$message ='';
// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){
    
    //Check data for special characters
    $username = secure_input($_POST["username"]);
    $email = secure_input($_POST["email"]);
    $role = secure_input($_POST["role"]);
    
    // Validate credentials
    if(empty($message)){

        $user = new stdClass();
        $user->username = $username ;
        $user->email = $email ;
        $user->role = $role;
        $data = json_encode($student);

        // $header = array("Authorization: "." ".$_SESSION["token_type"]." ".$_SESSION["access_token"]);
        callAPI('PUT', $auth_service.'/users?username='.$username, $data, false);


        // Attempt to execute the prepared statement
        if($httpcode == 200){
            $message = '<span style="color:green">You updated a user!</span>';
        }elseif($httpcode == 401){
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
</head>
<body>
    <?php include 'menu.php'; ?>
    <div id="content" class="bg">
        <div class="container">
            Edit User
            <div class="student_list">
                <table>
                    <tr>
                        <th style="width: 23%"><strong>Username</strong></th>
                        <th style="width: 23%"><strong>Email</strong></th>
                        <th style="width: 23%"><strong>Role</strong></th>
                        <th style="width: 8%; text-align: center;"><strong>Action</strong></th>
                     </tr>
                <?php
                
                // Show all users in the database
                $header = array("access_token: ".$_SESSION["token"]);
                $get_data = callAPI('GET', $auth_service.'/users', false, $header);
                $response = json_decode($get_data, true);
                $response = json_decode($response, true);

                if ($httpcode == 200) {
                    echo $message;
                    foreach ($response as $user){ 
    echo '<form name='.$user['username'].'" class="form-inline" action="'.htmlspecialchars($_SERVER["PHP_SELF"]).'" method="post">
        <input type="text" id="username" placeholder="Enter username" name="username" value="'.$user['username'].'" required>
        <input type="email" id="email" placeholder="Enter email" name="email" value="'.$user['email'].'" required>
        
        <select id="role" name="role"  data-selected="'.$user['role'].'" required>
            <option value="player">Player</option>
            <option value="official">Official</option>
            <option value="admin">admin</option>
        <button type="submit">Submit</button>
    </form>';
                    }
                }else{
                    echo "<tr>";
                    echo '<td colspan="4" style="text-align: center;">Error</td>';
                    echo "</tr>";
                }
                ?>
                </table>
            </div>
            
        </div>
    </div>
    <?php include 'footer.php'; ?> 
</body>
</html>