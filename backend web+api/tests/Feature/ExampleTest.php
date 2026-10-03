<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * The dashboard at `/` sits inside the `auth` group, so a guest is sent to
     * login rather than served a 200 (the stock scaffolding assertion never
     * matched this app).
     */
    public function test_the_application_redirects_guests_to_login(): void
    {
        $this->get('/')->assertRedirect('/login');
    }
}
