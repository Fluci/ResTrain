<?php
/**
 * Entry point for website. Checks input and decides on page to display.
 *
 * PHP version 5
 *
 * @category Website
 * @package  ResTrain
 * @author   Felice Serena <felice@serena-mueller.ch>
 * @license  http://www.opensource.org/licenses/mit-license.html  MIT License
 */
require_once __DIR__.'/../environment.php';

// ///// Print stuff
$PAGE['jsIncludes'][] = 'js/resistor_controller.js';
$PAGE['jsIncludes'][] = 'js/training.js';
$PAGE['nav_active']   = 'training';

$PAGE['jsHeadSnippets'][] = '
var tt;
function init(){
    var setting = document.getElementById(\'bands_count\');
    setting.onchange = function(){tt.setToBands(parseInt(this.value));}
    tt = new Tester(document.getElementById(\'test\'));
    setting.onchange();
}
window.addEventListener("load", init, false);';

$template = $TWIG->loadTemplate('training.html.twig');
echo $template->render(
    array(
        'page' => $PAGE
    )
);
