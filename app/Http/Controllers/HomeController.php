<?php

namespace App\Http\Controllers;

class HomeController extends Controller
{
    public function __invoke()
    {
        return inertia('home');
    }
    
    public function index()
    {
        return inertia('home');
    }
}
