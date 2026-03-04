<?php
/*

Plugin Name: Countup JS 
Plugin URI:
Description: Easily incorporate countup.js into your wordpress site through an easy to use shortcode.  CountUp.js is a dependency-free, lightweight JavaScript "class" that can be used to quickly create animations that display numerical data in a more interesting way.  Based off of https://inorganik.github.io/countUp.js/
Author: Barry Ross
Version: 1.4
Author URI: http://www.4d-media.com/plugins
License: The MIT License (MIT)
*/

/* ------------------------------------------------------------------------ *
 * Activation and setup
 * ------------------------------------------------------------------------ */

  function cujswp_activation(){
    $defaultCounterSettings = array(
        'easing' => 'true',
        'grouping' => 'true',
        'seperator' => ',',
        'decimal' => '.',
        'prefix' => '',
        'suffix' => ''
      );
  add_option('cujswp_options', $defaultCounterSettings);
  }

  // Deactivation settings
  function cujswp_deactivation(){
  delete_option('cujswp_options');
  }

  //Scripts
  function cujswp_script() {

    wp_enqueue_script('jquery');
    wp_register_script('countupjs_core', plugins_url('js/countup.js', __FILE__),array("jquery"));
    wp_enqueue_script('countupjs_core');
    wp_register_script('countupjs_initialize', plugins_url('js/initialize.countup.js', __FILE__));
  }

  //activation calls
  register_activation_hook(__FILE__,'cujswp_activation');
  register_deactivation_hook(__FILE__,'cujswp_deactivation');
  add_action('wp_enqueue_scripts', 'cujswp_script');


  /* ------------------------------------------------------------------------ *
   * Menu item and settings pages and registration
   * ------------------------------------------------------------------------ */

  add_action('admin_menu', 'cujswp_page_menu');
  function cujswp_page_menu() {
    add_options_page('Countup.js Options', 'Countup.js Options', 'manage_options', 'cujswp-option-page', 'cujswp_option_page_setup');
  }


  //output form, settings and fields sections on plugin's options page
  add_action('admin_init','cujswp_settings_init');
  function cujswp_option_page_setup(){
    ?><div class="wrap">
        <h2>Countup.JS Options page</h2>
        <form method="post"action="options.php">
        <?php settings_fields('cujswp-settings'); ?>
        <?php do_settings_sections('cujswp-option-page'); ?>
        <table><?php do_settings_fields('cujswp-option-page','cujswp-settings-section' ); ?></table>
        <?php submit_button(); ?>
      </form>
    </div>
    <?php
  }

  //Initialize settings
  function cujswp_settings_init(){
    add_settings_section('cujswp-settings-section,','Countup.js Settings','cujswp_settings_setup','cujswp-option-page');

    add_settings_field('cujswp-easing','Easing ','cujswp_checkbox','cujswp-option-page','cujswp-settings-section', array('name'=>'easing'));
    add_settings_field('cujswp-grouping','Grouping ','cujswp_checkbox','cujswp-option-page','cujswp-settings-section', array('name'=>'grouping'));
    add_settings_field('cujswp-serperator','Seperator ','cujswp_textfield','cujswp-option-page','cujswp-settings-section', array('name'=>'seperator'));
    add_settings_field('cujswp-decimal','Decimal ','cujswp_textfield','cujswp-option-page','cujswp-settings-section', array('name'=>'decimal'));
    add_settings_field('cujswp-prefix','Prefix ','cujswp_textfield','cujswp-option-page','cujswp-settings-section', array('name'=>'prefix'));
    add_settings_field('cujswp-suffix','Suffix ','cujswp_textfield','cujswp-option-page','cujswp-settings-section', array('name'=>'suffix'));
    register_setting('cujswp-settings','cujswp_options');

  }

  //Callback from settings setup initialization
  function cujswp_settings_setup(){
  echo "<p>Set the options for your counter</p>";
  }

  //Define textfield output
  function cujswp_textfield($args){
    extract($args);
    $optionArray=(array)get_option('cujswp_options');
    $current_value=$optionArray[$name];
    echo '<input type="text" name="cujswp_options['.$name.']" value="'.$current_value.'"/>'.$explanation.'</br>';
  }
  //Define checkbox output
  function cujswp_checkbox($args) {
    extract($args);
    $optionArray=(array)get_option('cujswp_options');
    $current_value=$optionArray[$name];
     echo '<input name="cujswp_options['.$name.']" id="cujswp_options['.$name.']" type="checkbox" value="true" class="code" ' . checked( 'true', $current_value, false ) . ' /> ' .$explanation.'</br></br>';
   }

  /* ------------------------------------------------------------------------ *
   * Frontend
   * ------------------------------------------------------------------------ */
  add_shortcode("countup", "cujswp_display");

  function cujswp_display($atts, $content){
    $optionArray=(array)get_option('cujswp_options');
    //Attributes for counter
  	  $a = shortcode_atts( array(
          'start' => '0',
          'end' => '1000',
          'decimals' => '0',
          'duration' => '2',

      ), $atts );

    //Pass variable to initialize.countup.js
    $config_array = array(
    				'start'=>$a['start'],
            'end'=>$a['end'],
            'decimals'=>$a['decimals'],
          	'duration'=>$a['duration'],
            'easing' => $optionArray['easing'],
            'grouping' => $optionArray['grouping'],
            'seperator' => $optionArray['seperator'],
            'decimal' => $optionArray['decimal'],
            'prefix' => $optionArray['prefix'],
            'suffix' => $optionArray['suffix']
    		);

    wp_localize_script('countupjs_initialize', 'setting', $config_array);
    wp_enqueue_script('countupjs_initialize');

	 $output = '<div class="type-wrap"><span id="counterupJSElement" style="white-space:pre;"></span></div>';
   return $output;
}

?>
