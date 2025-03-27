<?php

namespace App\Http\Controllers;

use App\Models\Faq;

class HomeController extends Controller
{
    public function __invoke()
    {
        return inertia('front/home/index');
    }

    public function index()
    {
        $faqsByCategory = Faq::where('is_active', 1)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('category');

        $categories = $faqsByCategory->keys();

        return inertia('front/home/index', [
            'faqCategories' => $categories,
            'faqsByCategory' => $faqsByCategory,
        ]);
    }
}
