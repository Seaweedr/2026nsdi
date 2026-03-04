// $niceScroll -------


if ("ontouchstart" in document.documentElement){
    // 是觸控裝置
}

else{
	// 非觸控裝置
	function niceScrollActive(){
        $("body:not(.is-fullPage)").niceScroll({
            scrollspeed: 65, // scrolling speed
            mousescrollstep: 40, // scrolling speed with mouse wheel (pixel)
            cursorcolor: "rgba(0,0,0,0.2)", // change cursor color in hex
            cursorwidth: "8px", // cursor width in pixel (you can also write "5px")
            cursorborder: "0px)", // css definition for cursor border
            enablekeyboard: false,
        });

        $("html").css('overflow', 'hidden');

	}
	$('.re-niceScroll').on('click', function(){
	    setTimeout(function(){
	        $("body:not(.is-fullPage)").getNiceScroll().resize();
	    }, 500)
	})
	$(window).on('resize', function(){
        $("body:not(.is-fullPage)").getNiceScroll().resize();

	})
	niceScrollActive();



}