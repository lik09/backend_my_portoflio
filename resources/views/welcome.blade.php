<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>MS Portfolio</title>
         
        <!-- Favicon -->
        <link rel="icon" type="image/png" href="{{ asset('logo/favicon.png') }}">
        <link rel="shortcut icon" type="image/png" href="{{ asset('logo/favicon.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('logo/favicon.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100..900&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="icon" type="image/png" href="{{ asset('logo/favicon.png') }}">

        <!-- Styles / Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
      
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
