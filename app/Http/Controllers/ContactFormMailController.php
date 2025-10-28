<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactFormMailController extends Controller
{
    public function send(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Preview mode (just return email HTML without sending)
        if ($request->query('preview') == 1) {
            $html = (new ContactFormMail($validated))->render();
            return response($html, 200)->header('Content-Type', 'text/html');
        }

        // Send email
        Mail::to('nhorn.lik0101@gmail.com')->send(new ContactFormMail($validated));

        return response()->json([
            'status'  => 'success',
            'message' => 'Email sent successfully!'
        ]);
    }

    
}
