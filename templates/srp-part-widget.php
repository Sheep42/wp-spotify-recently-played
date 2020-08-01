<?php

if( !defined( 'ABSPATH' ) )
	die( 'not permitted' );

?>

<div id="ds-spotify-recently-played-container">

	<button id="ds-spotify-recently-played-toggle">What am I listening to?</button>

	<div id="ds-spotify-recently-played">
		
		<div class="current-track">
			<h4>Currently Playing</h4>
			
			<div class="track">
				<div class="track-name">Track 1</div>
				<div class="artist-name">purpan</div>
				<div class="album-name">Album</div>
			</div>
		</div><!-- ./current-track -->

		<div class="recent-list">
			<h4>Recently Played</h4>

			<ul>
				<li class="track">
					<div class="track-name">Track 1</div>
					<div class="artist-name">By: <a href="">purpan</a></div> - <div class="album-name"><a href="">Album</a></div>
					<div class="played-at">20 minutes ago</div>
				</li>

				<li class="track">
					<div class="track-name">Track 1</div>
					<div class="artist-name">By: purpan</div> - <div class="album-name">Album</div>
					<div class="played-at">20 minutes ago</div>
				</li>

				<li class="track">
					<div class="track-name">Track 1</div>
					<div class="artist-name">By: purpan</div> - <div class="album-name">Album</div>
					<div class="played-at">20 minutes ago</div>
				</li>
			</ul>
		</div><!-- ./recent-list -->

	</div>

</div>