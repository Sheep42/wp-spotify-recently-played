<?php 

/**
 * Plugin Name: Spotify Recently Played
 * Description: Displays Spotify Currently playing & recently played data on your WordPress website
 * 
 * Author: Dan Shedd
 * Author URI: https://dshedd.com/
 */

if( !class_exists( 'SpotifyRecentlyPlayed' ) ):

if( !defined( 'SPOTIFY_PLUGIN' ) )
    define( 'SPOTIFY_PLUGIN', __FILE__ );

if( !defined( 'SPOTIFY_PLUGIN_DIR' ) )
    define( 'SPOTIFY_PLUGIN_DIR', untrailingslashit( dirname( SPOTIFY_PLUGIN ) ) );

class SpotifyRecentlyPlayed {

	private static $instance;
	private $settings;

	private function __construct() {

		if( null !== self::$instance )
			return self::$instance;

		self::$instance = $this;

		register_deactivation_hook( SPOTIFY_PLUGIN, array( &$this, 'srp_deactivation' ) );

        //Register the plugin options
        register_setting(
            'spotify-recently-played',
            'srp_options',
            array(&$this, 'srp_validate_input')
        );

        $this->settings = ( get_option('srp_options') ) ? get_option( 'srp_options' ) : array();

        //Registers the admin menu
        add_action('admin_menu', array(&$this, 'srp_admin_menu'));

        //Fires on WP init
        add_action('init', array(&$this, 'srp_init'));

        //Fires on WP admin_init
        add_action('admin_init', array(&$this, 'srp_admin_init'));

	}

	public static function srp_deactivation() {

	}

	public function srp_validate_input( $input ) {
		return $input;
	}

	public function srp_admin_menu() {

        add_menu_page('Settings - Spotify Recently Played', 'Spotify Recently Played', 'manage_options', 'spotify-recently-played', array(&$this, 'srp_render_settings'), 'dashicons-format-audio');

	}

	public function srp_render_settings() {

		if( !current_user_can( 'manage_options' ) ) 
			return;

		require_once SPOTIFY_PLUGIN_DIR . '/templates/srp-admin-settings.php';

	}

	public function srp_init() {

	}

	public function srp_admin_init() {
 		
        add_settings_section(
            'srp_settings_section',
            'Settings',
            array(&$this, 'srp_settings_section'),
            'spotify-recently-played'
        );

        add_settings_field(
            'srp_client_id',
            'Client ID',
            array(&$this, 'srp_client_id_field'),
            'spotify-recently-played',
            'srp_settings_section',
            [
                'label_for' => 'srp_client_id',
                'class' => 'srp_row'
            ]
        );

        add_settings_field(
            'srp_client_secret',
            'Client Secret',
            array(&$this, 'srp_client_secret_field'),
            'spotify-recently-played',
            'srp_settings_section',
            [
                'label_for' => 'srp_client_secret',
                'class' => 'srp_row'
            ]
        );

	}

	public function srp_settings_section( $args ) {

    }

    public function srp_client_id_field( $args ) {
    	
    	require_once SPOTIFY_PLUGIN_DIR . '/templates/settings/settings-text.php';

    }

	public function srp_client_secret_field( $args ) {

		require_once SPOTIFY_PLUGIN_DIR . '/templates/settings/settings-password.php';

	}

	public static function get_instance() {

		if( null !== self::$instance )
			return self::$instance;
		else
			return new self();

	}

}

$SpotifyRecentlyPlayed = SpotifyRecentlyPlayed::get_instance();

endif;