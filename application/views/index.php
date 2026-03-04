<!DOCTYPE html>
<html lang="zh-TW" xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes">

    <title>山川久也網站設計公司｜網頁設計 UNLIMITED 無設限｜首頁</title>
    <meta name="description" content="山川久也網站設計公司｜網頁設計 UNLIMITED 無設限。我們不走設計大師的本質路線，也不標榜自身力行的個人主義，完全的無限無框，甚至人生不做設計也可以。我們喜歡的是舒適的設計與生活，就像山跟川一樣，長久的存在於天地之間，經過時間的洗禮是如此自然協調讓人喜愛。我們專注網站的設計美學，重視APP的UIUX設計，不斷研發新的後台系統功能，更提供完善的網站主機與保固維護。為客戶提供全套完整的解決方案，從網站設計、APP設計、系統開發到網站主機，讓您體驗最好的設計服務。">
    <meta name="keywords" content="山川久也網站設計公司,設計美學,UIUX設計,網站設計,APP設計,系統開發,網站主機,設計服務">

    <?php require_once(APPPATH.'views/_include_link.php');?>

    <script type="application/ld+json">
    <?php echo seo_jsonld_localbusiness($base_url); ?>
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <script defer src="<?php echo $base_url; ?>assets/front/js/index.js?v=12"></script>
</head>

<body class="homepage index-css nsdi-theme loading-in">
    <noscript>您的瀏覽器不支援JavaScript功能， 若網頁功能無法正常使用時，請開啟瀏覽器JavaScript狀態</noscript>

    <div class="grain-overlay" aria-hidden="true"></div>

    <?php require_once(APPPATH.'views/_header.php');?>

    <div class="homepage-wrap">

        <!-- HERO — Organic blob tunnel -->
        <section class="nomo-hero" id="hero">
            <canvas class="nomo-hero__canvas" id="heroCanvas"></canvas>

            <!-- Layered organic blob shapes (tunnel portal) -->
            <div class="nomo-hero__blobs" aria-hidden="true">
                <div class="nomo-blob nomo-blob--1"></div>
                <div class="nomo-blob nomo-blob--2"></div>
                <div class="nomo-blob nomo-blob--3"></div>
                <div class="nomo-blob nomo-blob--4"></div>
                <div class="nomo-blob nomo-blob--5"></div>
                <div class="nomo-blob nomo-blob--6"></div>
                <div class="nomo-blob nomo-blob--7"></div>
            </div>

            <div class="nomo-hero__content">
                <div class="nomo-hero__label anim-reveal">NSDI DESIGN STUDIO</div>
                <h1 class="nomo-hero__title">
                    <span class="anim-reveal" data-delay="200">網頁設計</span>
                    <span class="nomo-hero__title-accent anim-reveal" data-delay="400">UNLIMITED</span>
                    <span class="anim-reveal" data-delay="600">無設限</span>
                </h1>
                <p class="nomo-hero__desc anim-reveal" data-delay="900">山川久也的職人團隊以多年的經驗，為您打造富有高度資安<br class="d-none d-lg-inline">及未來成長性的商業官網。讓網站成為企業最穩固的數位資產。</p>
                <div class="nomo-hero__cta anim-reveal" data-delay="1100">
                    <a href="<?php echo base_url('contact'); ?>" class="nomo-btn nomo-btn--primary"><span>立即洽詢</span></a>
                    <a href="#works" class="nomo-btn nomo-btn--ghost"><span>瀏覽作品</span></a>
                </div>
            </div>

            <div class="nomo-hero__scroll anim-reveal" data-delay="1500">
                <div class="nomo-hero__scroll-line"></div>
                <span>SCROLL</span>
            </div>
        </section>


        <!-- SERVICES -->
        <section class="nomo-section nomo-services" id="services">
            <div class="nomo-services__bg-glow" aria-hidden="true"></div>

            <div class="nomo-section-header anim-reveal">
                <span class="nomo-section-header__num">01</span>
                <h2 class="nomo-section-header__title">Our Services</h2>
                <p class="nomo-section-header__sub">專業服務</p>
            </div>

            <div class="nomo-service-block">
                <div class="nomo-service-block__visual anim-reveal">
                    <div class="nomo-service-block__img-wrap">
                        <img src="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-servers01_04.webp" alt="客製化網站設計" data-rjs="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-servers01_04@2x.webp" loading="lazy"/>
                    </div>
                    <div class="nomo-service-block__img-float">
                        <img src="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-servers01_05.webp" alt="網站設計作品" data-rjs="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-servers01_05@2x.webp" loading="lazy"/>
                    </div>
                </div>
                <div class="nomo-service-block__info anim-reveal" data-delay="200">
                    <span class="nomo-service-block__tag">WEB DESIGN</span>
                    <h3 class="nomo-service-block__title">客製化<br>網站設計</h3>
                    <p class="nomo-service-block__desc">拒絕 WordPress 套版風險，堅持採用原生開發，從源頭杜絕資安漏洞。我們擁有完整的 In-house 團隊嚴格把關，為您建構最穩固的企業數位資產。</p>
                    <a href="<?php echo $base_url; ?>webdesign" class="nomo-btn nomo-btn--outline"><span>詳細介紹</span><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
            </div>

            <div class="nomo-service-block nomo-service-block--reverse">
                <div class="nomo-service-block__visual anim-reveal">
                    <div class="nomo-service-block__img-wrap">
                        <img src="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-server02_02.webp" alt="APP設計" data-rjs="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-server02_02@2x.webp" loading="lazy"/>
                    </div>
                    <div class="nomo-service-block__img-float">
                        <img src="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-server02_03.webp" alt="APP設計作品" data-rjs="<?php echo $base_url; ?>assets/front/images/hompage_services/img_home-server02_03@2x.webp" loading="lazy"/>
                    </div>
                </div>
                <div class="nomo-service-block__info anim-reveal" data-delay="200">
                    <span class="nomo-service-block__tag">APP DESIGN</span>
                    <h3 class="nomo-service-block__title">客製化<br>APP 設計</h3>
                    <p class="nomo-service-block__desc">山川久也提供 iOS 與 Android 雙平台原生開發服務，確保運作效能最快、使用者體驗最流暢。從購物商城到物聯網設備控制，我們強大的後端團隊能支援百萬級資料運算與即時連線需求。</p>
                    <a href="<?php echo $base_url; ?>appdesign" class="nomo-btn nomo-btn--outline"><span>詳細介紹</span><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
            </div>
        </section>


        <!-- WORKS -->
        <section class="nomo-section nomo-works" id="works">
            <div class="nomo-section-header nomo-section-header--light anim-reveal">
                <span class="nomo-section-header__num">02</span>
                <h2 class="nomo-section-header__title">Our Works</h2>
                <p class="nomo-section-header__sub">作品一覽</p>
            </div>

            <div class="nomo-works__grid">
                <?php foreach ($works as $key => $work): ?>
                <a href="<?php echo base_url('works/info/'.$work['aid']); ?>" class="nomo-work-card anim-reveal" data-delay="<?php echo ($key % 4) * 120; ?>" title="<?php echo $work['title']; ?>">
                    <div class="nomo-work-card__img">
                        <img data-no-retina src="<?php echo base_url($work['cover']); ?>" alt="<?php echo $work['title']; ?>" loading="lazy"/>
                    </div>
                    <div class="nomo-work-card__info">
                        <span class="nomo-work-card__idx"><?php echo str_pad($key + 1, 2, '0', STR_PAD_LEFT); ?></span>
                        <h3 class="nomo-work-card__name"><?php echo $work['title']; ?></h3>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>

            <div class="nomo-works__cta anim-reveal">
                <a href="<?php echo base_url('works'); ?>" class="nomo-btn nomo-btn--primary"><span>更多作品</span></a>
            </div>
        </section>


        <!-- WHY NSDI -->
        <section class="nomo-section nomo-why" id="why-nsdi">
            <div class="nomo-why__bg-glow" aria-hidden="true"></div>

            <div class="nomo-section-header anim-reveal">
                <span class="nomo-section-header__num">03</span>
                <h2 class="nomo-section-header__title">Why NSDI</h2>
                <p class="nomo-section-header__sub">選擇山川久也</p>
            </div>

            <div class="nomo-why__grid">
                <div class="nomo-feature-card anim-reveal" data-delay="0">
                    <div class="nomo-feature-card__number">01</div>
                    <div class="nomo-feature-card__icon"><svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="8" stroke="currentColor" stroke-width="2"/><path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
                    <h3 class="nomo-feature-card__title">PM 專案經理</h3>
                    <p class="nomo-feature-card__desc">拆解商業邏輯，溝通零落差。從需求訪談到上線驗收，全程專人管理，確保專案品質與時程。</p>
                </div>
                <div class="nomo-feature-card anim-reveal" data-delay="150">
                    <div class="nomo-feature-card__number">02</div>
                    <div class="nomo-feature-card__icon"><svg width="40" height="40" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="24" rx="2" stroke="currentColor" stroke-width="2"/><path d="M6 18h36" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/><circle cx="22" cy="14" r="1.5" fill="currentColor"/><path d="M16 38h16M20 34h8v4h-8z" stroke="currentColor" stroke-width="2"/></svg></div>
                    <h3 class="nomo-feature-card__title">UI/UX 設計</h3>
                    <p class="nomo-feature-card__desc">兼具品牌美感與實際體驗。以使用者為中心的設計思維，打造直覺、流暢的互動介面。</p>
                </div>
                <div class="nomo-feature-card anim-reveal" data-delay="300">
                    <div class="nomo-feature-card__number">03</div>
                    <div class="nomo-feature-card__icon"><svg width="40" height="40" viewBox="0 0 48 48" fill="none"><path d="M16 14l-8 10 8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 14l8 10-8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 8L20 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
                    <h3 class="nomo-feature-card__title">前後端工程</h3>
                    <p class="nomo-feature-card__desc">提供客製後台、API 串接與資安防護。原生開發拒絕套版，從源頭杜絕資安漏洞。</p>
                </div>
            </div>
        </section>

        <?php require_once(APPPATH.'views/_footer.php');?>
    </div>

    <?php require_once(APPPATH.'views/_include_script.php');?>
</body>
</html>
