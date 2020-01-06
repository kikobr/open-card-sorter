Vue.component('app-ending', {
    data: () => {
        return {}
    },
    props: {
        authenticated: {
            default: false,
        },
        texts: {
            type: Object,
            default: window.texts
        }
    },
    methods: {
        refresh: function(){
            window.location.reload();
        },
        userNameText: function(text){
            let name = this.authenticated ? this.authenticated.userName.split(" ")[0] : "";
            return text
                .replace("%userNameComma", `${name ? ", " : ""}${name}`)
                .replace("%userName", name);
        },
    },
    template: `
        <main class="intro">
            <img class="intro__icon" src="img/check.svg" alt="Check icon" />
            <header class="intro__header">
                <h1 v-for="t in texts.endingTitle" v-html="userNameText(t)"></h1>
                <p v-for="t in texts.endingText" v-html="t"></p>
            </header>
            <footer class="intro__footer">
                <button class="btn-secondary" @click="refresh">
                <span v-for="t in texts.resetButton" v-html="t"></span>
                </button>
            <footer>
        </main>
    `,
});
