<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuidanceClassRequest;
use App\Http\Requests\UpdateGuidanceClassRequest;
use App\Models\GuidanceClass;

class GuidanceClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/guidance-classes/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGuidanceClassRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(GuidanceClass $guidanceClass)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GuidanceClass $guidanceClass)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGuidanceClassRequest $request, GuidanceClass $guidanceClass)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GuidanceClass $guidanceClass)
    {
        //
    }
}
