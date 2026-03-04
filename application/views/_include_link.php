<meta name="author" content="<?php echo $head['company'];  ?>">
<meta name="company" content="<?php echo $head['company'];  ?>">
<meta name="copyright" content="<?php echo $head['company'];  ?>">

<meta property="og:title" content="<?php echo $seometa['title']; ?>">
<meta property="og:site_name" content="<?php echo $seometa['site_name']; ?>">
<meta property="og:type" content="<?php echo $seometa['type']; ?>">
<meta property="og:url" content="<?php echo $seometa['url']; ?>">
<meta property="og:description" content="<?php echo $seometa['description']; ?>">
<meta property="og:image" content="<?php echo (!empty($seometa['image'])) ? $seometa['image'] : $base_url.'assets/front/images/ogimage.jpg'; ?>">

<!-- Canonical -->
<?php echo seo_canonical($seometa['url']); ?>

<!-- hreflang -->
<link rel="alternate" hreflang="zh-TW" href="<?php echo htmlspecialchars($seometa['url'], ENT_QUOTES, 'UTF-8'); ?>" />

<!-- Twitter Card -->
<?php echo seo_twitter_card($seometa, $base_url); ?>

<!-- JSON-LD: WebPage + Organization -->
<script type="application/ld+json">
<?php echo seo_jsonld_webpage($seometa, $base_url); ?>
</script>

<?php if (!empty($seometa['breadcrumb'])): ?>
<!-- JSON-LD: Breadcrumb -->
<script type="application/ld+json">
<?php echo seo_jsonld_breadcrumb($seometa['breadcrumb']); ?>
</script>
<?php endif; ?>

<?php if (!empty($seometa['service_name'])): ?>
<!-- JSON-LD: Service -->
<script type="application/ld+json">
<?php echo seo_jsonld_service($seometa['service_name'], $seometa['description'], $seometa['url']); ?>
</script>
<?php endif; ?>

<!-- 引入link -->
<link rel="shortcut icon" type="image/x-icon" href="<?php echo $base_url; ?>assets/front/images/favicon.ico" />
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Noto+Sans+TC:500,700&display=swap" rel="stylesheet">
<?php if (isset($is_homepage) && $is_homepage): ?>
<link type="text/css" rel="stylesheet" href="<?php echo $base_url; ?>assets/front/js/bootstrap5/css/bootstrap.min.css">
<?php else: ?>
<link type="text/css" rel="stylesheet" href="<?php echo $base_url; ?>assets/front/js/bootstrap3/css/bootstrap.min.css">
<?php endif; ?>
<link type="text/css" rel="stylesheet" href="<?php echo $base_url; ?>assets/front/css/reset.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $base_url; ?>assets/front/css/fast.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $base_url; ?>assets/front/css/article.css?20191008v13">

<div class="preload-img" style="display:none">
	<img data-no-retina src="<?php echo $base_url; ?>assets/front/images/loading/loading_01.svg" alt="">
	<img data-no-retina src="<?php echo $base_url; ?>assets/front/images/loading/loading_02.svg" alt="">
	<img data-no-retina src="<?php echo $base_url; ?>assets/front/images/loading/loading_03.svg" alt="">
	<img data-no-retina src="<?php echo $base_url; ?>assets/front/images/loading/loading_04.svg" alt="">
</div>
<!-- <link type="text/css" rel="stylesheet" href="js/animate.css"> -->
<!--animate css-->
<!-- <link type="text/css" rel="stylesheet" href="js/swiper/swiper.min.css"> -->
<!--swiper css-->
<!-- <link type="text/css" rel="stylesheet" href="js/fullPage/jquery.fullpage.css"> -->
<!--fullpage css-->

<!-- <link type="text/css" rel="stylesheet" href="css/_css_keyframes.css" > -->
<!--css keyframes -->
<!-- <link type="text/css" rel="stylesheet" href="css/_header.css"> -->
<!--header css-->
<!-- <link type="text/css" rel="stylesheet" href="css/main.css" > -->
<!--main css-->
<!-- <link type="text/css" rel="stylesheet" href="css/_footer.css" > -->
<!--footer css-->

<!-- GZIP -->
<link rel="stylesheet" media="screen" href="<?php echo $base_url; ?>assets/front/js/plugins-css.php?20191206v1" />
<link rel="stylesheet" media="screen" href="<?php echo $base_url; ?>assets/front/css/front-css.php?20260213v4" />





<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '277999455913492');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt=""
src="https://www.facebook.com/tr?id=277999455913492&ev=PageView&noscript=1"
/></noscript>
<!-- DO NOT MODIFY -->
<!-- End Facebook Pixel Code -->


<!--google https分析-->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-24965387-3', 'auto');
  ga('set', 'displayFeaturesTask', null);
  ga('require', 'linkid');
  ga('send', 'pageview');

</script>

<!--google 分析-->

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3T13YBC554"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-3T13YBC554');
</script>




