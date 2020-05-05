<?php
// print_r(scandir(session_save_path()));
$allSessions = [];
$sessionNames = scandir(session_save_path());

foreach($sessionNames as $sessionName) {
    $sessionName = str_replace("sess_","",$sessionName);
    if(strpos($sessionName,".") === false) { //This skips temp files that aren't sessions
        session_id($sessionName);
        session_start();
        $allSessions[$sessionName] = $_SESSION;
        if ($_SESSION["token"] == 10) {
        	$_SESSION["b"] = 400;
        	// echo "found";
        	break;
        }
        //session_abort();
    }
}
print_r($allSessions);