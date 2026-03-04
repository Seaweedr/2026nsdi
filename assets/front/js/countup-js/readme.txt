=== Countup JS ===
Contributors: Barry Ross
Tags: wordpress, plugin, counter.js, counterup, js counter
Requires at least: 3.5
Tested up to: 4.9.2
Stable tag: 1.5
License: The MIT License (MIT)

Countup JS allows you to quickly create animations that display numerical data in a more interesting way on your wp site.

== Description ==

This plugin is based on and utilizes CountUp.js, which is a dependency-free, lightweight JavaScript "class" that can be used to quickly create animations that display numerical data in a more interesting way.

Based off of: https://inorganik.github.io/countUp.js/

== Installation ==

1. Use the Wordpress Installer, Updater
2. Activate in the "Plugins" admin panel
3. Visit the "Countup.js" menu option in the "settings" tab to configure options

== Usage & Configuration ==

Simply add the following shortcode to your posts, pages or widgets `[countup]`

1) Basic customization can occur through the shortcode arguments

The shortcode accepts the following arguments

- start: number to begin the counter from
- end: number to end the counter at
- decimals: # of decimal places to show
- duration: time in second or the counter to round

`[countup start="5" end="100" decimals="3" duration="5"]`

2) Further adjustments can be made through the settings panel, in the Countup.js options page, for the following options:

```
easing:
grouping: groups the content into sections (eg. 1,000 vs 1000)
seperator: (default is comma)
decimal: symbol to use for decimal spot
prefix: ( character(s) at beginning of string )
suffix: ( character(s) at end of string )
```

== Screenshots ==

1. Example of the output on a page
2. Example short code 
3. Additional options
== Changelog ==


= 1.4 = 

Added screenshots

= 1.0 =
* Alpha release



== Upgrade Notice ==
