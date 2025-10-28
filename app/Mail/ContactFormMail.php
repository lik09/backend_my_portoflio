<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function build()
    {
        // Use raw HTML instead of a Blade view
        return $this->subject($this->data['subject'])
                    ->html(
                        "<h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> {$this->data['name']}</p>
                        <p><strong>Email:</strong> {$this->data['email']}</p>
                        <p><strong>Message:</strong> {$this->data['message']}</p>"
                    );
    }
}
