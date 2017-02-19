<?php
/**
 * Configuration file for the website.
 *
 * PHP version 5
 *
 * @category Config
 * @package  ResTrain
 * @author   Felice Serena <felice@serena-mueller.ch>
 * @license  http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace config;

$dynConfig = require_once STAT_CONFIG_ROOT.'/config.php';
$debug     = !$dynConfig['production'];

return array_merge(
    $dynConfig,
    array(
        'local' => array(
            'lang_code' => 'de'
        ),
        'twig' => array(
            'properties' => array(
                'autoescape' => true,
                'cache' => VER_TWIG_CACHE,
                'debug' => $debug,
                'strict_variables' => $debug,
            )
        ),
        'debug' => $debug,
        'error_reporting_level' => ($debug === true ? -1 : 0),
        'use_mock' => $debug,
        'timezone' => 'Europe/Zurich'
    )
);
