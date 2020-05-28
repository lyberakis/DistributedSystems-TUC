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

// Check if the user is logged in, if not then redirect him to login page
// if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
//     header("location: index.php");
//     exit;
// }

require_once 'config.php';
require_once 'functions.php';
//read the loaded games

$target_dir = "/var/www/html/games/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$fileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$message = '';
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    // Check if file already exists
    if (file_exists($target_file)) {
      $message = "Sorry, file already exists.";
      $uploadOk = 0;
    }

    // Check file size
    if ($_FILES["fileToUpload"]["size"] > 500000) {
      $message =  "Sorry, your file is too large.";
      $uploadOk = 0;
    }

    // Allow certain file formats
    if($fileType != "zip" ) {
      $message =  "Sorry, only ZIP files are allowed.";
      $fileType = 0;
    }

    // Check if $uploadOk is set to 0 by an error
    if ($uploadOk == 0) {
      $message =  "Sorry, your file was not uploaded.";
    // if everything is ok, try to upload file
    } else {
      if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $message =  "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.";
        $message = unzipGame($target_file);
      } else {
        $message =  "Sorry, there was an error uploading your file.";
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
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" enctype="multipart/form-data">
              Select zip to upload:
                <input type="file" name="fileToUpload" id="fileToUpload" required>
                <input type="submit" value="Upload Game" name="submit">
            </form>
            <div class="notifier"><?php echo $message; ?></div>
        </div>
    </div>
    <?php include 'footer.php'; ?> 
</body>
</html>