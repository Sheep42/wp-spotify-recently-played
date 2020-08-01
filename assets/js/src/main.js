(function($) {

	const $document = $( document );
	const $window = $( window );
	const $container = $( '#ds-spotify-recently-played-container' );
	const $toggle_btn = $( '#ds-spotify-recently-played-toggle' );
	const $widget = $( '#ds-spotify-recently-played' );
	const $footer = $( '#footer' );

	$document.ready( function() {

		$container.css({
			'bottom': -($widget.outerHeight() + 1) + 'px'
		});

		$toggle_btn.on( 'click', function( e ) {
			
			e.preventDefault();

			let _this = $(this);
			let scroll_bottom = $window.height() + $window.scrollTop();
			let footer_top = $footer.offset().top;

			let elem_offset = ( scroll_bottom >= footer_top ) ? scroll_bottom - footer_top - 1 : 0;

			if( $container.hasClass( 'expanded' ) ) {

				elem_offset -= $widget.outerHeight();
				$container.removeClass( 'expanded' );

			} else {

				$container.addClass( 'expanded' );

			}

			if( elem_offset !== 0 )
				elem_offset += 'px';

			$container.stop().animate({
				'bottom': elem_offset
			});

		});

		let try_get_spotify_data = function() {

			let __srp_nonce = ajax_object.srp_get_track_info_nonce;
			let action = 'get_spotify_track_info';

			let post_data = {
				__srp_nonce,
				action
			};

			$.post(
				ajax_object.ajax_url,
				post_data,
				function( response ) {

					if( false === response.success ) { 
						console.error( response.data.message );
						clearInterval( try_get_loop );
					}

					console.log( response.data );

				}
			)

		};

		let try_get_loop = setInterval( try_get_spotify_data, 5000 );
		try_get_spotify_data();

	});

	$window.on( 'scroll', function( e ) {

		let scroll_bottom = $window.height() + $window.scrollTop();
		let footer_top = $footer.offset().top
		
		let elem_offset = ( scroll_bottom >= footer_top ) ? scroll_bottom - footer_top - 1 : 0;

		if( !$container.hasClass( 'expanded' ) ) {
			elem_offset -= $widget.outerHeight();
		}

		if( elem_offset !== 0 )
			elem_offset += 'px';

		$container.css({
			'bottom': elem_offset
		});

	});

})(jQuery);