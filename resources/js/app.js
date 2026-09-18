import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import GlobalNotifications from './components/GlobalNotifications.vue'

createInertiaApp({
    title: (title) => (title ? `${title} — GrillVibes` : 'GrillVibes'),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        createApp({
            render: () => h('div', [
                h(App, props),
                h(GlobalNotifications),
            ]),
        })
            .use(plugin)
            .mount(el)
    },
})
