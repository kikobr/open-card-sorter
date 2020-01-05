Vue.component('app-intro', {
    data: () => {
        return {}
    },
    props: {
        authenticated: {
            default: false,
        },
        gapiConnected: {
            type: Boolean,
            default: false,
        },
        texts: {
            type: Object,
            default: window.texts
        }
    },
    methods: {
        userNameText: function(text){
            let name = this.authenticated ? this.authenticated.userName.split(" ")[0] : "";
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
                <!-- Google Button -->
                <button class="google-btn" @click="$emit('authenticate')" :disabled="!gapiConnected">
                    <img class="google-btn__img" src="img/google-btn-logo.svg" alt="Google Logo" />
                    <span v-if="authenticated" class="google-btn__text" v-for="t in texts.googleAuthConnectAs" v-html="t + ' ' + authenticated.userName"></span>
                    <span v-else class="google-btn__text" v-for="t in texts.googleAuthConnect" v-html="t"></span>
                </button>
                <button v-if="authenticated" class="btn-secondary" @click="$emit('disconnect')">
                    <span v-for="t in texts.googleAuthDisconnect" v-html="t"></span>
                </button>
            </footer>
        </main>
    `,
});
