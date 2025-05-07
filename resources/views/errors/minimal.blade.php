<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Terjadi Kesalahan')</title>
    <style>
        :root {
            --bg-color: #f7fafc;
            --container-bg: #ffffff;
            --text-color: #4a5568;
            --heading-color: #e53e3e;
            --subheading-color: #2d3748;
            --link-color: #4299e1;
            --shadow-color: rgba(0, 0, 0, 0.1);
        }
        
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #1a202c;
                --container-bg: #2d3748;
                --text-color: #e2e8f0;
                --heading-color: #fc8181;
                --subheading-color: #e2e8f0;
                --link-color: #63b3ed;
                --shadow-color: rgba(0, 0, 0, 0.3);
            }
        }
        
        body { 
            font-family: 'Nunito', sans-serif; 
            background-color: var(--bg-color); 
            color: var(--text-color); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            text-align: center; 
            padding: 20px; 
            transition: background-color 0.3s ease;
        }
        .container { 
            background-color: var(--container-bg); 
            padding: 30px 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px var(--shadow-color); 
            max-width: 600px;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        h1 { 
            font-size: 2.8rem; 
            color: var(--heading-color); 
            margin-top: 0; 
            margin-bottom: 0.5rem; 
        }
        h2 { 
            font-size: 1.6rem; 
            color: var(--subheading-color); 
            margin-bottom: 1.5rem; 
        }
        p { 
            font-size: 1.1rem; 
            margin-bottom: 2rem; 
            line-height: 1.5;
        }
        .buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 10px;
        }
        .btn {
            display: inline-block;
            color: var(--container-bg);
            text-decoration: none;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 6px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn:hover {
            text-decoration: none;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px var(--shadow-color);
        }
        .btn-primary {
            background-color: var(--link-color);
        }
        .btn-secondary {
            background-color: #718096;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>@yield('code', 'Oops!')</h1>
        <h2>@yield('message_title', 'Ada yang Salah')</h2>
        <p>@yield('message', 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.')</p>
        <div class="buttons">
            <a href="javascript:history.back()" class="btn btn-secondary">Kembali ke Halaman Sebelumnya</a>
            <a href="{{ url('/') }}" class="btn btn-primary">Kembali ke Beranda</a>
        </div>
    </div>
</body>
</html>