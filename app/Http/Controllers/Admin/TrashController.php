<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\GlobalVariable;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrashController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'users');

        $data = [
            'users' => User::onlyTrashed()->get(),
            'tutorials' => Tutorial::onlyTrashed()->get(),
            'internships' => Internship::onlyTrashed()->get(),
            'logbooks' => Logbook::onlyTrashed()->get(),
            'reports' => Report::onlyTrashed()->get(),
            'faqs' => Faq::onlyTrashed()->get(),
            'globalVariables' => GlobalVariable::onlyTrashed()->get(),
            'guidanceClasses' => GuidanceClass::onlyTrashed()->get(),
        ];

        return inertia('admin/trash/index', [
            'users' => $data['users'],
            'tutorials' => $data['tutorials'],
            'internships' => $data['internships'],
            'logbooks' => $data['logbooks'],
            'reports' => $data['reports'],
            'faqs' => $data['faqs'],
            'globalVariables' => $data['globalVariables'],
            'guidanceClasses' => $data['guidanceClasses'],
            'meta' => [
                'total' => count($data[$type]),
                'per_page' => 10,
                'current_page' => 1,
                'last_page' => 1,
            ],
        ]);
    }

    public function restore($type, $id)
    {
        $model = match ($type) {
            'users' => User::class,
            'tutorials' => Tutorial::class,
            'internships' => Internship::class,
            'logbooks' => Logbook::class,
            'reports' => Report::class,
            'faqs' => Faq::class,
            'global-variables' => GlobalVariable::class,
            'guidance-classes' => GuidanceClass::class,
            default => null,
        };

        if (!$model) {
            return back()->with('error', 'Tipe data tidak valid.');
        }

        $item = $model::withTrashed()->findOrFail($id);

        $item->restore();

        return back()->with('success', 'Data berhasil dipulihkan.');
    }

    public function forceDelete($type, $id)
    {
        $model = match ($type) {
            'users' => User::class,
            'tutorials' => Tutorial::class,
            'internships' => Internship::class,
            'logbooks' => Logbook::class,
            'reports' => Report::class,
            'faqs' => Faq::class,
            'global-variables' => GlobalVariable::class,
            'guidance-classes' => GuidanceClass::class,
            default => null,
        };

        if (!$model) {
            return back()->with('error', 'Tipe data tidak valid.');
        }

        $item = $model::withTrashed()->findOrFail($id);

        $item->forceDelete();

        return back()->with('success', 'Data berhasil dihapus permanen.');
    }
} 