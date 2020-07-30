<input 
	type="text" 
	id="<?php esc_attr_e( $args['label_for'] ); ?>"
    name="srp_options[<?php esc_attr_e( $args['label_for'] ); ?>]"
	value="<?php echo !empty( $this->settings[ $args['label_for'] ] ) ? esc_attr( $this->settings[ $args['label_for'] ] ) : ''; ?>"
/>