<?php

/*
    Plugin Name: Are you paying attention
    Description: Give your readers a multiple choice question.
    Version: 1.0
    Author: Mike Caballero
*/

if (!defined('ABSPATH')) exit; // Exit if accessed directly in this file

class AreYouPayingAttention
{
    function __construct()
    {
        //add_action('enqueue_block_editor_assets', [$this, 'adminAssets']);
        add_action('init', [$this, 'adminAssets']);
    }

    function adminAssets()
    {
        wp_register_style(
            'quizeditcss',
            plugin_dir_url(__FILE__) . 'build/index.css'
        );

        wp_register_script(
            'ourNewBlockType',
            plugin_dir_url(__FILE__) . 'build/index.js',
            ['wp-blocks', 'wp-element', 'wp-editor']
        );

        register_block_type(__DIR__, [
            //'editor_script' => 'ourNewBlockType',
            //'editor_style'  => 'quizeditcss',
            'render_callback'   => [$this, 'theHTML']
        ]);
    }

    function theHTML($attributes)
    {
        if (!is_admin()) {
            // Styles and JS added here to load them only if the block type is used in the current page
            wp_enqueue_script('attentionFrontend', plugin_dir_url(__FILE__) . 'build/frontend.js', ['wp-element']);
            //wp_enqueue_style('attentionFrontendStyles', plugin_dir_url(__FILE__) . 'build/frontend.css');
        }

        ob_start(); ?>
        <div class="paying-attention-update-me">
            <pre style="display: none;"><?= json_encode($attributes); ?></pre>
        </div>
<?php
        return ob_get_clean();
    }
}

$areYoyPayingAttention = new AreYouPayingAttention();
