export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_context_menu_header: 'Location',					
				map_context_menu_close_button: 'Close'					
			};
			
		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_context_menu_header: 'Position',								
				map_context_menu_close_button: 'Schließen',					
			};

		default:
			return {};
	}
};