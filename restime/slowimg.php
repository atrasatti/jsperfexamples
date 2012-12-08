<?php

$file = '.' . $_SERVER['PATH_INFO'];
sleep(2);
header("Content-type: image/jpeg");
header('Cache-Control: must-revalidate');
header('Content-Length: ' . filesize($file));
ob_clean();
flush();
readfile($file);
exit;


?>
