<?php

$sessionName = $_GET['id'];
$limit = 0;

do{
	sleep(2);
	if ($limit >= 120*60) {
		
		return false;
	}
	session_id($sessionName);
	session_start();
	$condition = $_SESSION["gm"] == '' &&  $_SESSION["pm"] =='';
	session_abort();
	$limit = $limit +1;

}while ($condition == true);
sleep(2);

return true;
?>