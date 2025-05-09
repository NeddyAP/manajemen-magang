<?php

namespace App\Enums;

enum TutorialAccessLevelEnum: string
{
    case MAHASISWA = 'mahasiswa';
    case DOSEN = 'dosen';
    case ALL = 'all';
}
