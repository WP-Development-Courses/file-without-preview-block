<?php
/**
 * Plugin Name:       File Block Without Preview
 * Description:       A fork of the WordPress File block that removes the preview setting.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            WP Development Courses
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        false
 *
 * @package           wpdc
 */

function wpdc_file_block_no_preview_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'wpdc_file_block_no_preview_block_init' );
