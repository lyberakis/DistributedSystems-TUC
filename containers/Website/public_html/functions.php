<?php
//This prevents attackers from exploiting the code by injecting HTML or Javascript code (Cross-site Scripting attacks) in forms.

function secure_input($data) {
  $data = trim($data);       //strip unnecessary characters (extra space, tab, newline) 
  $data = stripslashes($data);  //Remove backslashes (\) from the user input data
  $data = htmlspecialchars($data); //This function converts special characters to HTML entities
  return $data;
}

$httpcode = 0;
function callAPI($method, $url, $data, $header){
   $curl = curl_init($url);
   switch ($method){
      case "POST":
         curl_setopt($curl, CURLOPT_POST, 1);
         if ($data)
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
         break;
      case "PUT":
         curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
         if ($data)
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);		
         break;
      case "DELETE":
         curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
         break;
      default:
         if ($data)
            $url = sprintf("%s?%s", $url, http_build_query($data));
   }
   curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
   curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
   
   if($header){
      curl_setopt($curl,CURLOPT_HTTPHEADER,$header);
   }
   // EXECUTE:
   $result = curl_exec($curl);
   $GLOBALS['httpcode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
   
   curl_close($curl);

   return $result;
}

// Get the list of available games
function getGames(){
  $list = array();
  if ($handle = opendir('./games')) {
    while (false !== ($entry = readdir($handle))) {

      if ($entry != "." && $entry != "..") {

        array_push($list, $entry);
      }
    }
    closedir($handle);
  }

  return $list;
}

function unzipGame($file){
  // get the absolute path to $file
  $path = pathinfo(realpath($file), PATHINFO_DIRNAME);

  $zip = new ZipArchive;
  $res = $zip->open($file);
  if ($res === TRUE) {
    // extract it to the path we determined above
    $zip->extractTo($path);
    $zip->close();

    if (!unlink($file)) {  
      return "$file extracted to $path and not deleted!";  
    }  
    else {  
      return "$file extracted to $path and deleted!";  
    }
  } else {
    return "I couldn't open $file";
  }
}
?>