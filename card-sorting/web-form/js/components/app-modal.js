Vue.component('app-modal', {
    data: () => {
        return {}
    },
    props: {
        alert: {
            type: Object
        },
        texts: {
            type: Object,
            default: window.texts
        }
    },
    methods: {
        emitAction: function(action){
            this.$emit(action);
        },
    },
    template: `
        <section class="app-modal">
            <article class="app-modal__content" :style="alert.style ? alert.style : false">
                <header class="app-modal__header">
                    <h2 class="app-modal__title" v-for="t in alert.title" v-html="t"></h2>
                    <p class="app-modal__text" v-for="t in alert.text" v-html="t"></p>
                    <div v-if="alert.textHtml" v-html="alert.textHtml"></div>
                </header>
                <footer v-if="alert.buttons && alert.buttons.length" class="app-modal__footer">
                    <button v-for="button, i in alert.buttons" :class="button.class" @click="emitAction(button.action)" :tabindex="i+1">
                        <span v-for="t in button.text" v-html="t"></span>
                    </button>
                </footer>
            </article>
        </section>
    `,
});
