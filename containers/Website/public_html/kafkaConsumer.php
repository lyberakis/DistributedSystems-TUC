<?php

function setGameParam($obj){
	//session_abort();
	$sessionNames = scandir(session_save_path());
	$playersNum = count($obj->{'players'});
	$i = 0;

	foreach($sessionNames as $sessionName) {
	    $sessionName = str_replace("sess_","",$sessionName);
	    if(strpos($sessionName,".") === false) { //This skips temp files that aren't sessions
	        session_id($sessionName);
	        session_start();

	        // update each session of player in the game
	        foreach($obj->{'players'} as $token) {
	        	if ($_SESSION['token'] == $token) {
		        	$_SESSION["gm"] = $obj->{'gm'};
		        	$_SESSION["pm"] = $obj->{'game_port'};
		        	$_SESSION["game"] = $obj->{'game'};
		        	$i = $i + 1;
		        	//var_dump($_SESSION);
		        	
	        	}
	        }
	        session_commit();

	        //if all players are updated with the ports, stop
	        if ($i >= $playersNum) {
	        	break;
	        }
	    }
	}
}

function debug_to_console($data) {
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);

    echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
}

require 'vendor/autoload.php';
$config = \Kafka\ConsumerConfig::getInstance();
$config->setMetadataRefreshIntervalMs(10000);
$config->setMetadataBrokerList('kafka:9092');
$config->setGroupId(strval(rand(0, 10005)));
$config->setBrokerVersion('1.0.0');
$config->setTopics(['output']);
$consumer = new \Kafka\Consumer();

$consumer->start(function($topic, $part, $message) {
	$value = json_decode($message["message"]["value"]);
	$obj = json_decode($value);
	// var_dump($value);
	// var_dump($array) ;
	// echo $obj->{'players'}[0];
	
    setGameParam($obj);
});


