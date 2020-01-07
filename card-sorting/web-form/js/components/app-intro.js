Vue.component('app-intro', {
    data: () => {
        return {}
    },
    props: {
        loading: {
            default: false,
        },
        authenticated: {
            default: false,
        },
        texts: {
            type: Object,
            default: window.texts
        }
    },
    methods: {
        userNameText: function(text){
            let name = this.authenticated && this.authenticated.userName ? this.authenticated.userName.split(" ")[0] : "";
            return text
                .replace("%userNameComma", `${name ? ", " : ""}${name}`)
                .replace("%userName", name);
        },
    },
    template: `
        <main class="intro">
            <header class="intro__header">
                <h1 v-for="t in texts.introTitle" v-html="userNameText(t)"></h1>
                <p v-for="t in texts.introText" v-html="t"></p>
            </header>
            <footer class="intro__footer">
                <p v-for="t in texts.introPreAuth" v-html="t"></p>
                <form class="intro__form" name="authentication" @submit.prevent="$emit('connect')">
                    <div class="input">
                        <input :placeholder="texts.nameInputPlaceholder" v-model="authenticated.userName" required />
                        <span class="focus"></span>
                    </div>
                    <button :disabled="!authenticated.userName || loading" class="btn-primary" type="submit">
                        <span v-for="t in texts.start" v-html="t"></span>
                    </button>
                </form>
            </footer>
        </main>
    `,
});
