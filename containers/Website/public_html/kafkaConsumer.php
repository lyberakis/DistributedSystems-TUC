<?php


function test($token, $port){
	$sessionNames = scandir(session_save_path());

	foreach($sessionNames as $sessionName) {
	    $sessionName = str_replace("sess_","",$sessionName);
	    if(strpos($sessionName,".") === false) { //This skips temp files that aren't sessions
	        session_id($sessionName);
	        session_start();

	        if ($_SESSION["token"] == $token) {
	        	$_SESSION["b"] = $port;
	        	session_write_close();
	        	break;
	        }
	        session_write_close();
	    }
	}
}


require 'vendor/autoload.php';
$config = \Kafka\ConsumerConfig::getInstance();
$config->setMetadataRefreshIntervalMs(10000);
$config->setMetadataBrokerList('kafka:9092');
$config->setGroupId('test');
$config->setBrokerVersion('1.0.0');
$config->setTopics(['input']);
$consumer = new \Kafka\Consumer();

$consumer->start(function($topic, $part, $message) {

	
	$value = json_decode($message["message"]["value"]);

	// echo $value->{'token'};
    // var_dump($message);
    test($value->{'token'},$value->{'game'});
});


