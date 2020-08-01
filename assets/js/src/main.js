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
						$container.hide();
					}

					let json_response = JSON.parse( response.data );
					render_currently_playing( json_response.current_track );

				}
			)

		};

		let try_get_loop = setInterval( try_get_spotify_data, seconds_to_ms( 10 ) );
		try_get_spotify_data();

	});

	$window.on( 'scroll', reposition_container );

	function reposition_container() {

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

	}

	function render_currently_playing( current_track ) {

		let $current_track_container = $widget.find( '.current-track' );
		let $track_container = $current_track_container.find( '.track' );

		if( null == current_track ) {
			$current_track_container.fadeOut( 400, function() {
				$track_container.html( '' );
				reposition_container();
			});

			return;
		}

		let last_track_id = $current_track_container.find( '.track-id' ).val();

		// do nothing until the track changes
		if( last_track_id == current_track.item.id )
			return;

		$track_container.fadeOut( 400, function() {
			
			$track_container.html( track_html );

			$track_container.show();
			reposition_container();
			$track_container.hide();

			$track_container.fadeIn( 400, function() {
				
				if( !$current_track_container.is( ':visible' ) ) {
					$current_track_container.show();
					reposition_container();
					$current_track_container.hide();

					$current_track_container.fadeIn();
				}

			});

		});

		let track_html = get_track_html( current_track.item );

	}

	function get_track_html( track_data ) {
		
		let track_html = `
			<input type="hidden" class="track-id" value="${ track_data.id }" />
			
			<div class="track-name">
				<a href="${ track_data.external_urls.spotify }" target="_blank">${ track_data.name }</a>
			</div>

			<div class="artist-name">
				<a href="${ track_data.artists[0].external_urls.spotify }" target="_blank">${ track_data.artists[0].name }</a>
			</div> &ndash; <div class="album-name">
				<a href="${ track_data.album.external_urls.spotify }" target="_blank">${ track_data.album.name }</a>
			</div>
		`;

		if( typeof track_data.played_at !== 'undefined' ) {

			track_html += `
			<div class="played-at">${ track_data.played_at }</div>
			`;
		}

		return $.parseHTML( track_html );

	}

	function seconds_to_ms( seconds ) {
		return seconds * 1000;
	}

})(jQuery);