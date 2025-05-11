<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Logbook Magang</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px; /* Smaller font size for table data */
            line-height: 1.3;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            border: 1px solid #a0a0a0; /* Lighter border for less visual clutter */
            padding: 6px; /* Reduced padding */
            text-align: left;
            vertical-align: top; /* Align text to top for long entries */
        }
        th {
            background-color: #e9e9e9; /* Lighter background for header */
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            padding: 15px;
            font-style: italic;
        }
        /* Minimal styling, focused on the table */
    </style>
</head>
<body>
    @if(isset($logbooks) && $logbooks->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Tanggal</th>
                    <th>Rincian Kegiatan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($logbooks as $logbook)
                    <tr>
                        <td>
                            @if(isset($logbook->date))
                                {{ \Carbon\Carbon::parse($logbook->date)->translatedFormat('d M Y') }}
                            @else
                                N/A
                            @endif
                        </td>
                        <td>{!! nl2br(e($logbook->activities ?? '')) !!}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="no-data">Tidak ada data logbook yang tersedia.</p>
    @endif
</body>
</html>