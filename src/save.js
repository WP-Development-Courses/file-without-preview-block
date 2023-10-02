/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		href,
		fileId,
		fileName,
		textLinkHref,
		textLinkTarget,
		showDownloadButton,
		downloadButtonText,
	} = attributes;

	// Only output an `aria-describedby` when the element it's referring to is
	// actually rendered.
	const describedById = RichText.isEmpty( fileName ) ? fileId : undefined;

	return (
		href && (
			<div { ...useBlockProps.save() }>
				<a
					id={ describedById }
					href={ textLinkHref }
					target={ textLinkTarget }
					rel={
						textLinkTarget ? 'noreferrer noopener' : undefined
					}
				>
					<RichText.Content value={ fileName } />
				</a>
				{ showDownloadButton && (
					<a
						href={ href }
						className={ classnames(
							'wp-block-file__button',
							__experimentalGetElementClassName( 'button' )
						) }
						download={ true }
						aria-describedby={ describedById }
					>
						<RichText.Content value={ downloadButtonText } />
					</a>
				) }
			</div>
		)
	);
}
