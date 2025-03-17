<?php

/*
	Plugin Name: Are you paying attention
	Description: Give your readers a multiple choice question.
	Version: 1.0
	Author: Miguel Caballero
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly in this file
}

class Are_You_Paying_Attention {

	/**
	 * Initializes the plugin by adding hooks.
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'add_scripts' ] );
	}

	/**
	 * Adds the block type to the WordPress editor.
	 * 
	 * @return void
	 */
	public function add_scripts() {

		// Block editor styles
		wp_register_style(
			'quiz-block-css',
			plugin_dir_url( __FILE__ ) . 'build/index.css'
		);

		// Block editor script JS
		wp_register_script(
			'quiz-block-js',
			plugin_dir_url( __FILE__ ) . 'build/index.js',
			[ 'wp-blocks', 'wp-element', 'wp-editor' ]
		);

		// Register block type - comments are because JS and CSS files are registered in block.json
		register_block_type( __DIR__, [ 
			//'editor_script' => 'quiz-block-js',
			//'editor_style'  => 'quiz-block-css',
			'render_callback' => [ $this, 'block_type_html' ]
		] );
	}

	/**
	 * Renders the block type in the frontend.
	 * 
	 * @param array $attributes The block attributes.
	 * @return string The block HTML.
	 */
	public function block_type_html( array $attributes ): string {
		if ( ! is_admin() ) {
			// Styles and JS added here to load them only if the block type is used in the current page
			wp_enqueue_script( 'front-block-js', plugin_dir_url( __FILE__ ) . 'build/frontend.js', [ 'wp-element' ], '1.0', true );
		}

		ob_start(); ?>
		<div class="paying-attention-update-me">
			<pre style="display: none;"><?= json_encode( $attributes ); ?></pre>
		</div>
		<?php
		return ob_get_clean();
	}
}

$are_you_paying_attention = new Are_You_Paying_Attention();
