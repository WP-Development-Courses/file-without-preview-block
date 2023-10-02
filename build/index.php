<?php
/**
 * Registers the `core/file` block on server.
 */

function wpdc_register_file_no_preview_block() {
	register_block_type_from_metadata(
		__DIR__,
	);
}
add_action( 'init', 'wpdc_register_file_no_preview_block' );
