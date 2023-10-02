/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL, revokeBlobURL } from '@wordpress/blob';
import {
	__unstableGetAnimateClassName as getAnimateClassName,
	ToolbarButton,
	PanelBody,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	BlockControls,
	BlockIcon,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
	useBlockProps,
	InspectorControls,
	store as blockEditorStore,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { useCopyToClipboard } from '@wordpress/compose';
import { file as icon } from '@wordpress/icons';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';

function FileBlockInspector( {
	hrefs,
	openInNewWindow,
	showDownloadButton,
	changeLinkDestinationOption,
	changeOpenInNewWindow,
	changeShowDownloadButton,
} ) {
	const { href, textLinkHref, attachmentPage } = hrefs;

	let linkDestinationOptions = [ { value: href, label: 'URL' } ];
	if ( attachmentPage ) {
		linkDestinationOptions = [
			{ value: href, label: 'Media file' },
			{ value: attachmentPage, label: 'Attachment page' },
		];
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ 'Settings' }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ 'Link to' }
						value={ textLinkHref }
						options={ linkDestinationOptions }
						onChange={ changeLinkDestinationOption }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ 'Open in new tab' }
						checked={ openInNewWindow }
						onChange={ changeOpenInNewWindow }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ 'Show download button' }
						checked={ showDownloadButton }
						onChange={ changeShowDownloadButton }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}
function ClipboardToolbarButton( { text, disabled } ) {
	const { createNotice } = useDispatch( noticesStore );
	const ref = useCopyToClipboard( text, () => {
		createNotice( 'info', 'Copied URL to clipboard.', {
			isDismissible: true,
			type: 'snackbar',
		} );
	} );

	return (
		<ToolbarButton
			className="components-clipboard-toolbar-button"
			ref={ ref }
			disabled={ disabled }
		>
			{ 'Copy URL' }
		</ToolbarButton>
	);
}

function FileEdit( { attributes, setAttributes, clientId } ) {
	const {
		id,
		fileId,
		fileName,
		href,
		textLinkHref,
		textLinkTarget,
		showDownloadButton,
		downloadButtonText,
	} = attributes;
	const { media, mediaUpload } = useSelect(
		( select ) => ( {
			media:
				id === undefined
					? undefined
					: select( coreStore ).getMedia( id ),
			mediaUpload: select( blockEditorStore ).getSettings().mediaUpload,
		} ),
		[ id ]
	);

	const { createErrorNotice } = useDispatch( noticesStore );
	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch( blockEditorStore );

	useEffect( () => {
		// Upload a file drag-and-dropped into the editor.
		if ( isBlobURL( href ) ) {
			const file = getBlobByURL( href );

			mediaUpload( {
				filesList: [ file ],
				onFileChange: ( [ newMedia ] ) => onSelectFile( newMedia ),
				onError: onUploadError,
			} );

			revokeBlobURL( href );
		}

		if ( downloadButtonText === undefined ) {
			changeDownloadButtonText( 'Download' );
		}
	}, [] );

	useEffect( () => {
		if ( ! fileId && href ) {
			// Add a unique fileId to each file block.
			__unstableMarkNextChangeAsNotPersistent();
			setAttributes( { fileId: `wp-block-file--media-${ clientId }` } );
		}
	}, [ href, fileId, clientId ] );

	function onSelectFile( newMedia ) {
		if ( newMedia && newMedia.url ) {
			setAttributes( {
				href: newMedia.url,
				fileName: newMedia.title,
				textLinkHref: newMedia.url,
				id: newMedia.id,
			} );
		}
	}

	function onUploadError( message ) {
		setAttributes( { href: undefined } );
		createErrorNotice( message, { type: 'snackbar' } );
	}

	function changeLinkDestinationOption( newHref ) {
		// Choose Media File or Attachment Page (when file is in Media Library).
		setAttributes( { textLinkHref: newHref } );
	}

	function changeOpenInNewWindow( newValue ) {
		setAttributes( {
			textLinkTarget: newValue ? '_blank' : false,
		} );
	}

	function changeShowDownloadButton( newValue ) {
		setAttributes( { showDownloadButton: newValue } );
	}

	function changeDownloadButtonText( newValue ) {
		// Remove anchor tags from button text content.
		setAttributes( {
			downloadButtonText: newValue.replace( /<\/?a[^>]*>/g, '' ),
		} );
	}

	const attachmentPage = media && media.link;

	const blockProps = useBlockProps( {
		className: classnames(
			isBlobURL( href ) && getAnimateClassName( { type: 'loading' } ),
			{
				'is-transient': isBlobURL( href ),
			}
		),
	} );

	if ( ! href ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon={ <BlockIcon icon={ icon } /> }
					labels={ {
						title: 'File',
						instructions: 'Upload a file or pick one from your media library.',
					} }
					onSelect={ onSelectFile }
					onError={ onUploadError }
					accept="*"
				/>
			</div>
		);
	}

	return (
		<>
			<FileBlockInspector
				hrefs={ { href, textLinkHref, attachmentPage } }
				{ ...{
					openInNewWindow: !! textLinkTarget,
					showDownloadButton,
					changeLinkDestinationOption,
					changeOpenInNewWindow,
					changeShowDownloadButton
				} }
			/>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={ id }
					mediaURL={ href }
					accept="*"
					onSelect={ onSelectFile }
					onError={ onUploadError }
				/>
				<ClipboardToolbarButton
					text={ href }
					disabled={ isBlobURL( href ) }
				/>
			</BlockControls>
			<div { ...blockProps }>
				<div className={ 'wp-block-file__content-wrapper' }>
					<RichText
						tagName="a"
						value={ fileName }
						placeholder={ 'Write file name…' }
						withoutInteractiveFormatting
						onChange={ ( text ) =>
							setAttributes( { fileName: text } )
						}
						href={ textLinkHref }
					/>
					{ showDownloadButton && (
						<div
							className={
								'wp-block-file__button-richtext-wrapper'
							}
						>
							{ /* Using RichText here instead of PlainText so that it can be styled like a button. */ }
							<RichText
								tagName="div" // Must be block-level or else cursor disappears.
								aria-label={ 'Download button text' }
								className={ classnames(
									'wp-block-file__button',
									__experimentalGetElementClassName(
										'button'
									)
								) }
								value={ downloadButtonText }
								withoutInteractiveFormatting
								placeholder={ 'Add text…' }
								onChange={ ( text ) =>
									changeDownloadButtonText( text )
								}
							/>
						</div>
					) }
				</div>
			</div>
		</>
	);
}

export default FileEdit;
