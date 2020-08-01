<?php 

/**
 * Plugin Name: Spotify Recently Played
 * Description: Displays Spotify Currently playing & recently played data on your WordPress website
 * 
 * Author: Dan Shedd
 * Author URI: https://dshedd.com/
 */

if( !defined( 'SRP_PLUGIN' ) )
    define( 'SRP_PLUGIN', __FILE__ );

if( !defined( 'SRP_PLUGIN_DIR' ) )
    define( 'SRP_PLUGIN_DIR', untrailingslashit( dirname( SRP_PLUGIN ) ) );

require_once SRP_PLUGIN_DIR . '/vendor/autoload.php';

use \SpotifyWebAPI\SpotifyWebAPI;
use \SpotifyWebAPI\Session;

if( !class_exists( 'DS_SpotifyRecentlyPlayed' ) ):

class DS_SpotifyRecentlyPlayed {

	private static $instance;
	private $settings;
    private $session;
    private $client;

	private function __construct() {

		if( null !== self::$instance )
			return self::$instance;

		self::$instance = $this;

		register_deactivation_hook( SRP_PLUGIN, array( &$this, 'srp_deactivation' ) );

        register_setting(
            'spotify-recently-played',
            'srp_options',
            array(  &$this, 'srp_validate_input' ) 
        );

        $this->settings = ( get_option('srp_options') ) ? get_option( 'srp_options' ) : array();

        $this->session = new Session(
            $this->settings['srp_client_id'],
            $this->settings['srp_client_secret'],
            admin_url( '/' ) . 'admin.php?page=spotify-recently-played'
        );


        if( !empty( $this->settings['srp_access_token'] ) ) {
    
            $this->session->setAccessToken( $this->settings['srp_access_token'] );
            $this->session->setRefreshToken( $this->settings['srp_refresh_token'] );

            $options = [
                'auto_refresh' => true,
            ];

            $this->client = new SpotifyWebAPI( $options, $this->session );
            $this->client->setSession( $this->session );

            if( $this->session->getAccessToken() !== $this->settings['srp_access_token'] ) {

                $this->settings['srp_access_token'] = $this->session->getAccessToken();
                $this->settings['srp_refresh_token'] = $this->session->getRefreshToken();

                update_option( 'srp_options', $this->settings );

            }

        }

        add_action('admin_menu', array(&$this, 'srp_admin_menu'));
        add_action('init', array(&$this, 'srp_init'));
        add_action('admin_init', array(&$this, 'srp_admin_init'));
        add_action( 'load-toplevel_page_spotify-recently-played', array( &$this, 'srp_load_settings_page' ) );

	}

	public static function srp_deactivation() {

        remove_action( 'admin_menu', array( &$this, 'srp_admin_menu' ) );
        remove_action( 'init', array( &$this, 'srp_init' ) );
        remove_action( 'admin_init', array( &$this, 'srp_admin_init' ) );

        delete_option( 'srp_options' );

        unregister_setting(
            'spotify-recently-played',
            'srp_options'
        );

	}

    public function has_client_id_and_secret() {

        return !empty( $this->settings['srp_client_id'] ) && !empty( $this->settings['srp_client_secret'] );

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

		  include SRP_PLUGIN_DIR . '/templates/srp-admin-settings.php';

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

        add_settings_field(
            'srp_access_token',
            'Access Token',
            array(&$this, 'srp_access_token_field'),
            'spotify-recently-played',
            'srp_settings_section',
            [
                'label_for' => 'srp_access_token'
            ]
        );

        add_settings_field(
            'srp_refresh_token',
            'Refresh Token',
            array(&$this, 'srp_refresh_token_field'),
            'spotify-recently-played',
            'srp_settings_section',
            [
                'label_for' => 'srp_refresh_token'
            ]
        );

	}

	public function srp_settings_section( $args ) {

    }

    public function srp_client_id_field( $args ) {
    	
    	include SRP_PLUGIN_DIR . '/templates/settings/settings-text.php';

    }

	public function srp_client_secret_field( $args ) {

		include SRP_PLUGIN_DIR . '/templates/settings/settings-password.php';

	}

    public function srp_access_token_field( $args ) {

        include SRP_PLUGIN_DIR . '/templates/settings/settings-readonly.php';

    }

    public function srp_refresh_token_field( $args ) {

        include SRP_PLUGIN_DIR . '/templates/settings/settings-readonly.php';

    }

    public function srp_load_settings_page() {

        if( empty( $_GET['page'] ) )
            return;

        if( $_GET['page'] !== 'spotify-recently-played' )
            return;

        if( $this->should_get_code() ) {

            $this->srp_authenticate();

        } elseif( empty( $this->settings['srp_access_token'] ) && isset( $_GET['code'] ) ) {

            $this->srp_get_access_token();

        }

    }

    public function should_get_code() {
        return !empty( $this->settings['srp_client_id'] ) 
            && !empty( $this->settings['srp_client_secret'] )
            && empty( $this->settings['srp_access_token'] )
            && !isset( $_GET['code'] );
    }

    public function srp_authenticate() {

        $options = [
            'scope' => [
                'user-read-currently-playing',
                'user-read-recently-played'
            ],
        ];

        header( 'Location: ' . $this->session->getAuthorizeUrl( $options ) );
        die();

    }

    public function srp_get_access_token() {

        $this->session->requestAccessToken( $_GET['code'] );

        $this->settings['srp_access_token'] = $this->session->getAccessToken();
        $this->settings['srp_refresh_token'] = $this->session->getRefreshToken();

        update_option( 'srp_options', $this->settings );

    }

	public static function get_instance() {

		if( null !== self::$instance )
			return self::$instance;
		else
			return new self();

	}

}

$SpotifyRecentlyPlayed = DS_SpotifyRecentlyPlayed::get_instance();

endif;