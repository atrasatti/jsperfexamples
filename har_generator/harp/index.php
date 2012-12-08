<?php

if ($HTTP_RAW_POST_DATA) {
  if ($HTTP_RAW_POST_DATA) {
    $filename = md5(($HTTP_RAW_POST_DATA));
    if (!$fp = fopen('./files/'.$filename, w)) {
      echo "Cannot create temporary file";
      exit;
    }
    $tofile = 'onInputData('.$HTTP_RAW_POST_DATA.');';

    if (fwrite($fp, $tofile) === FALSE) {
      echo "Cannot write to file ($filename)";
      exit;
    }

    echo "Success. $filename";

    fclose($fp);
  } else {
    echo "No data to save";
  }
} else {
  echo "Nothing to do, you did not POST anything";
}

?>
