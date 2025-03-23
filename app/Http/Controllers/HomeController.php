<?php

namespace App\Http\Controllers;

class HomeController extends Controller
{
    public function __invoke()
    {
        return inertia('front/home/index');
    }

    public function index()
    {
        return inertia('front/home/index');
    }
}
