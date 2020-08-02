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

					if( null == json_response.current_track && null == json_response.recent_tracks && $container.is( ':visible' ) ) {
						$container.hide();
					}

					render_currently_playing( json_response.current_track );
					render_recently_played( json_response.recent_tracks );

				}
			);

		};

		let try_get_loop = setInterval( try_get_spotify_data, seconds_to_ms( 10 ) );
		try_get_spotify_data();

	});

	$window.on( 'scroll resize', reposition_container );

	function reposition_container() {

		let scroll_bottom = $window.height() + $window.scrollTop();
		let footer_top = $footer.offset().top;
		
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

		let track_html = get_track_html( current_track.item );

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

	}

	function render_recently_played( recent_tracks ) {
		
		let $recent_track_container = $widget.find( '.recently-played' );
		let $track_list = $recent_track_container.find( '.track-list' );

		if( null == recent_tracks ) {
			$recent_track_container.fadeOut( 400, function() {
				$track_list.html( '' );
				reposition_container();
			});

			return;
		}

		let last_track_id = $recent_track_container.find( '.track-id' ).first().val();

		let list_items = [];

		recent_tracks.items.forEach( function( item, index ) {

			let track_html = get_track_html( item.track, item.played_at );
			let list_item = $.parseHTML( `<li class="track"></li>` );

			$( list_item ).html( track_html );
			list_items.push( list_item );

		});

		// Update track time, without fade
		if( last_track_id == recent_tracks.items[0].track.id ) {
			
			$track_list.html('');

			for( let i = 0; i < list_items.length; i++ ) {
				$track_list.append( list_items[i] );
			}

		} else {

			$track_list.fadeOut( 400, function() {

				$track_list.html('');

				for( let i = 0; i < list_items.length; i++ ) {
					$track_list.append( list_items[i] );
				}

				$track_list.show();
				reposition_container();
				$track_list.hide();

				$track_list.fadeIn( 400, function() {

					if( !$recent_track_container.is( ':visible' ) ) {

						$recent_track_container.show();
						reposition_container();
						$recent_track_container.hide();

						$recent_track_container.fadeIn();

					}
					
				});


			});

		}

	}

	function get_track_html( track_data, played_at ) {
		
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

		if( typeof played_at !== 'undefined' ) {

			let now = new Date();
			let played_at_date = new Date( played_at );
			let diff = get_time_diff( now, played_at_date );

			for( let prop in diff ) {

				if( 0 == diff[prop] )
					continue;

				let label = diff[prop] > 1 ? prop : prop.substring( 0, prop.length - 1 );

				track_html += `
					<div class="played-at">${ diff[prop] } ${ label } ago</div>
				`;

				break;

			}

		}

		return $.parseHTML( track_html );

	}

	function get_time_diff( date1, date2 ) {

	    var difference = date1.getTime() - date2.getTime();

	    var daysDifference = Math.floor(difference/1000/60/60/24);
	    difference -= daysDifference*1000*60*60*24;

	    var hoursDifference = Math.floor(difference/1000/60/60);
	    difference -= hoursDifference*1000*60*60;

	    var minutesDifference = Math.floor(difference/1000/60);
	    difference -= minutesDifference*1000*60;

	    var secondsDifference = Math.floor(difference/1000);

		return {
			days: daysDifference,
			hours: hoursDifference,
			minutes: minutesDifference,
			seconds: secondsDifference
		};

	}

	function seconds_to_ms( seconds ) {
		return seconds * 1000;
	}

})(jQuery);