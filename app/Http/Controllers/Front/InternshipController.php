<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class InternshipController extends Controller
{
    /**
     * Display a listing of internships.
     */
    public function index()
    {
        return Inertia::render('front/internships/index');
    }
}
