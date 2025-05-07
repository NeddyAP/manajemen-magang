<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Terjadi Kesalahan')</title>
    <style>
        body { font-family: 'Nunito', sans-serif; background-color: #f7fafc; color: #4a5568; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
        .container { background-color: #fff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px; }
        h1 { font-size: 2.5rem; color: #e53e3e; margin-top: 0; margin-bottom: 0.5rem; }
        h2 { font-size: 1.5rem; color: #2d3748; margin-bottom: 1rem; }
        p { font-size: 1rem; margin-bottom: 1.5rem; }
        a { color: #4299e1; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>@yield('code', 'Oops!')</h1>
        <h2>@yield('message_title', 'Ada yang Salah')</h2>
        <p>@yield('message', 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.')</p>
        <a href="{{ url('/') }}">Kembali ke Beranda</a>
    </div>
</body>
</html>