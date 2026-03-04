<?php
if(extension_loaded('zlib')){//检查服务器是否开启了zlib拓展
    ob_start('ob_gzhandler');
}
header('content-type: text/javascript ; charset: UTF-8');//注意修改到你的编码
header('cache-control: must-revalidate');
$offset = 60 * 60 * 24;//js文件的距离现在的过期时间，这里设置为一天
$expire = 'expires: ' . gmdate('D, d M Y H:i:s', time() + $offset) . ' GMT';
header($expire);
ob_start('compress');

//包含你的全部js文档
include('bootstrap3/js/bootstrap.min.js');
include('bootstrap-add-clear.min.js');
include('swiper/swiper.min.js');

include('greensock/TweenMax.min.js');
include('wavify/jquery.wavify.js');

include('jquery.nicescroll.js');
include('cus-nicescroll.js');
include('perfect-scrollbar/perfect-scrollbar.min.js');

include('main.js');


if(extension_loaded('zlib')){
    ob_end_flush();//输出buffer中的内容，即压缩后的css文件
}
?>


