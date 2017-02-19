<?php
/**
 * Environment passed to templates.
 *
 * PHP version 5
 *
 * @category Config
 * @package  Chill
 * @author   Felice Serena <felice@serena-mueller.ch>
 * @license  http://www.opensource.org/licenses/mit-license.html  MIT License
 */

return array(
    'title' => 'ResistorTrain',
    'langCode' => $CONFIG['local']['lang_code'],
    'lang' => array(
        'training' => 'Home',
        'repository' => 'Github',
        'about' => 'About',
    ),
    'stylesheets' => array(
        array('url' => 'e/b/css/bootstrap.min.css'),
        array('url' => 'css/base.css'),
    ),
    'jsIncludes' => array(
        'js/base.js',
        'e/jquery-3.1.1.min.js',
    ),
    'jsHeadSnippets' => array(),
    'nav_active' => null,
    'nav' => array(
        'training' => './',
        'repository' => 'https://github.com/Fluci/ResTrain',
        'about' => './about.php'
    ),
    // 'thisPage' => $_SERVER['REQUEST_URI'].'?'.$_SERVER['QUERY_STRING']
    // 'logo' => array('url' => '/b/l/logo.png', 'alg' => 'Logo'),
    // 'jsFootSnippets' => array()
);
