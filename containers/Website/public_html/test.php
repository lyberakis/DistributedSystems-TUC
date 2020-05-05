<?php 


if (!isset($_SESSION)) {
    session_start();
    $_SESSION["token"] = $_REQUEST['token'];
	$_SESSION["a"] = '5';
}
echo $_SESSION["token"];
echo "\n";
echo $_SESSION["a"];
echo "\n";
echo $_SESSION["b"];
// echo '<pre>' . print_r($_SESSION, TRUE) . '</pre>';


// require_once "kafkaConsumer.php";

