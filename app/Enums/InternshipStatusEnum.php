<?php

namespace App\Enums;

enum InternshipStatusEnum: string
{
    case WAITING = 'waiting';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
}
