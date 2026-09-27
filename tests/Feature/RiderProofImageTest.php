<?php

namespace Tests\Feature;

use App\Http\Controllers\API\RiderOrderController;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class RiderProofImageTest extends TestCase
{
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=';

    private function accepts(Request $request): bool
    {
        $controller = new RiderOrderController;
        $method = new \ReflectionMethod($controller, 'proofImageRules');

        return Validator::make($request->all(), [
            'proof_image' => $method->invoke($controller, $request),
        ])->passes();
    }

    public function test_png_upload_with_generic_mime_is_accepted(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'proof');
        file_put_contents($path, base64_decode(self::PNG));

        try {
            $file = new UploadedFile($path, 'proof.png', 'application/octet-stream', UPLOAD_ERR_OK, true);
            $this->assertTrue($this->accepts(new Request([], [], [], [], ['proof_image' => $file])));
        } finally {
            unlink($path);
        }
    }

    public function test_base64_and_data_url_are_accepted(): void
    {
        foreach ([self::PNG, 'data:image/png;base64,'.self::PNG] as $value) {
            $this->assertTrue($this->accepts(Request::create('/', 'POST', ['proof_image' => $value])));
        }
    }

    public function test_invalid_payloads_are_rejected(): void
    {
        foreach (['file:///photo.png', ['uri' => 'file:///photo.png'], base64_encode('not an image')] as $value) {
            $this->assertFalse($this->accepts(Request::create('/', 'POST', ['proof_image' => $value])));
        }
    }

    public function test_proof_is_optional(): void
    {
        $this->assertTrue($this->accepts(new Request));
    }

    public function test_supplied_image_when_configured(): void
    {
        $path = getenv('RIDER_PROOF_TEST_IMAGE');
        if (! $path) {
            $this->markTestSkipped('Set RIDER_PROOF_TEST_IMAGE to verify a real upload.');
        }

        $file = new UploadedFile($path, basename($path), 'application/octet-stream', UPLOAD_ERR_OK, true);
        $this->assertTrue($this->accepts(new Request([], [], [], [], ['proof_image' => $file])));
        $this->assertTrue($this->accepts(Request::create('/', 'POST', [
            'proof_image' => 'data:image/png;base64,'.base64_encode(file_get_contents($path)),
        ])));
    }
}
