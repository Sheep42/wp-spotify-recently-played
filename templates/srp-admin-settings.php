<?php

if( !defined( 'ABSPATH' ) )
	die( 'not permitted' );

?>

<form action="options.php" method="post">

	<?php 
        settings_fields( 'spotify-recently-played' );

        do_settings_sections( 'spotify-recently-played' );

        submit_button('Save Settings');
	?>

</form>