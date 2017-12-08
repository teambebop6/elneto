requirejs.config({
    baseUrl: '/static',
    paths: {
        'jquery': 'vendor/jquery-1.10.2.min',
        'semantic': 'semantic/semantic.min',
				'slick': 'vendor/slick/slick.min',
				'galleria': 'vendor/galleria/galleria-1.4.2.min',
				'galleria.classic': 'vendor/galleria/themes/classic/galleria.classic.min'
		},
    shim: {
    	'semantic': ['jquery'],
			'slick': ['jquery'],
			'galleria.classic': ['galleria'],
			'galleria': ['jquery']
		}
});
