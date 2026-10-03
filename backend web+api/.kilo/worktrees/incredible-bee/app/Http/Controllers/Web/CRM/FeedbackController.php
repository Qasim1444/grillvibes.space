<?php

namespace App\Http\Controllers\Web\CRM;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Customer feedback: capture a rating against an order, reply to it, and control
 * whether it is published. Nothing here is auto-published — `is_published` is an
 * explicit decision because published rows are the ones safe to show publicly.
 */
class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $rating = trim((string) $request->query('rating', ''));
        $state = trim((string) $request->query('state', ''));

        $base = Feedback::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('comment', 'like', "%{$search}%")
                ->orWhere('order_id', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"))))
            ->when($rating !== '', fn ($q) => $q->where('rating', (int) $rating))
            ->when($state === 'unanswered', fn ($q) => $q->whereNull('replied_at'))
            ->when($state === 'answered', fn ($q) => $q->whereNotNull('replied_at'))
            ->when($state === 'published', fn ($q) => $q->where('is_published', true));

        return Inertia::render('CRM/Feedback', [
            'feedbacks' => (clone $base)
                ->with(['customer:id,name,contact', 'responder:id,name'])
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (Feedback $f) => [
                    'id' => $f->id,
                    'customer_id' => $f->customer_id,
                    'customer_name' => $f->customer?->name,
                    'customer_contact' => $f->customer?->contact,
                    'order_id' => $f->order_id,
                    'rating' => $f->rating,
                    'comment' => $f->comment,
                    'reply' => $f->reply,
                    'responder_name' => $f->responder?->name,
                    'replied_at' => $f->replied_at?->format('d M Y H:i'),
                    'is_published' => $f->is_published,
                    'created_at' => $f->created_at?->format('d M Y'),
                ]),
            'filters' => ['search' => $search, 'rating' => $rating, 'state' => $state],
            'stats' => [
                'total' => Feedback::count(),
                // Rounded here so the card and the sort order agree.
                'average' => round((float) Feedback::avg('rating'), 2),
                'unanswered' => Feedback::whereNull('replied_at')->count(),
                'negative' => Feedback::where('rating', '<=', 2)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_published' => ['boolean'],
        ]);

        $data['is_published'] = (bool) ($data['is_published'] ?? false);

        Feedback::create($data);

        return redirect()->back()->with('success', 'Feedback recorded.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $feedback = Feedback::findOrFail($id);

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_published' => ['boolean'],
        ]);

        $data['is_published'] = (bool) ($data['is_published'] ?? false);

        $feedback->update($data);

        return redirect()->back()->with('success', 'Feedback updated.');
    }

    public function reply(Request $request, $id): RedirectResponse
    {
        $feedback = Feedback::findOrFail($id);

        $data = $request->validate([
            'reply' => ['required', 'string', 'max:2000'],
        ]);

        $feedback->update([
            'reply' => $data['reply'],
            'replied_by' => $request->user()->id,
            'replied_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Reply saved.');
    }

    public function togglePublish($id): RedirectResponse
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->update(['is_published' => ! $feedback->is_published]);

        return redirect()->back()->with(
            'success',
            $feedback->is_published ? 'Feedback published.' : 'Feedback unpublished.'
        );
    }

    public function destroy($id): RedirectResponse
    {
        Feedback::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Feedback deleted.');
    }
}
