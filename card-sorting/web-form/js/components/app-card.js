Vue.component('app-card', {
    data: () => {
        return {}
    },
    props: {
        name: String,
        texts: {
            type: Object,
            default: window.texts
        }
    },
    template: `
        <article class="app-card">
            {{name}}
        </article>
    `,
});
