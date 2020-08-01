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
				Loading...
			</div>
		</div><!-- ./current-track -->

		<div class="recently-playe">
			<h4>Recently Played</h4>

			<ul class="track-list">
				<li class="track">
					<p>Loading...</p>
				</li>
			</ul>

		</div><!-- ./recent-list -->

	</div>

</div>