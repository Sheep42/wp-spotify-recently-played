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

			let elem_offset = ( scroll_bottom >= $footer.offset().top ) ? scroll_bottom - $footer.offset().top - 1 : 0;

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

	});

	$window.on( 'scroll', function( e ) {

		let scroll_bottom = $window.height() + $window.scrollTop();
		
		let elem_offset = ( scroll_bottom >= $footer.offset().top ) ? scroll_bottom - $footer.offset().top - 1 : 0;

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