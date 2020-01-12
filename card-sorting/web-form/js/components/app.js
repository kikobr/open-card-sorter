// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = `https://www.googleapis.com/auth/spreadsheets`;

var app = new Vue({
    el: '#app',
    components: ["app-intro", "app-card", "app-ending", "app-modal"],
    props: {
        texts: {
            type: Object,
            default: window.texts
        }
    },
    data: {
        alert: {
            open: false,
            title: [``],
            text: [ `` ],
            buttons: [
                { class: [`btn-primary`], text: [``], action: "close" }
            ]
        },
        /**
        * @param activityType "open", "closed"
        */
        activityType: "open",
        loading: false,
        authenticated: {
            userName: null,
        },
        queueStart: false,
        started: false,
        completed: false,
        SCRIPT_URL: null,
        selected: null,
        dragging: false,
        stack: [
            {
                list: [
                    {
                        id: 1,
                        name: "Item 1",
                        info: "Abacate",
                    },
                    {
                        id: 2,
                        name: "Item 2",
                    },
                    {
                        id: 3,
                        name: "Item 3",
                    },
                ]
            },
        ],
        originalStack: [{ list: [] }],
        groups: [
            {
                id: 10,
                list: [
                    {
                        id: 4,
                        name: "Item 4",
                    },
                    {
                        id: 5,
                        name: "Item 5",
                    },
                    {
                        id: 6,
                        name: "Item 6",
                    },
                ]
            },
            {
                id: 11,
                list: [
                    {
                        id: 7,
                        name: "Item 7",
                    },
                    {
                        id: 8,
                        name: "Item 8",
                    },
                    {
                        id: 9,
                        name: "Item 9",
                    },
                ]
            }
        ],

        hoverClass: "col-ghost--hover",
        animateStep: true,
    },
    created: function(){
        // this.SCRIPT_URL = `https://script.google.com/macros/s/${ this.getParameterByName("gs") }/dev`;
        this.SCRIPT_URL = `https://script.google.com/macros/s/${ this.getParameterByName("gs") }/exec`;

        this.authenticated.userName = window.localStorage.getItem("userName") || this.authenticated.userName;
        this.setOriginalStack()
        // this.getSpreadsheetCards();
    },
    beforeMount: function() {
        document.title = this.texts.appTitle.join(" ");

        // apply gaps if card sorting is of type="open"
        if(this.activityType=="open"){
            this.groups = this.getGroupGaps(this.groups);
        }
    },
    watch: {
        activeSteps: function(newVal, oldVal) {
            if (JSON.stringify(newVal) != JSON.stringify(oldVal)) this.animateStep = true;
        }
    },
    computed: {
        listsWithGaps: function() {
            let list = [
                []
            ];
            this.lists.forEach((l, index) => {
                list.push(l);
                list.push([]);
            });
            return list;
        },
        sidebarCardsGrouped: function() {
            let allCards = this.originalStack[0] ? this.originalStack[0].list.length : 0;
            let sidebarCardsRemaining = this.stack[0].list.filter((o) => o.name).length;
            return allCards - sidebarCardsRemaining;
        },
        groupedCardsCounter: function() {
            let text = this.texts.sidebarSubtitle[0];
            let split = text.split("%n");
            let allCards = this.originalStack[0] ? this.originalStack[0].list.length : 0;
            text = `<strong>${this.sidebarCardsGrouped}</strong>${split[1]}${allCards}${split[2]}`
            return text;
        },
        namedGroups: function() {
            return this.groups.filter((l) => l.title);
        },
        cardGroups: function(_list){
            let groups = this.groups;
            let cardGroups = groups.slice(0)
                .filter((g)=>g.list.length);
            return cardGroups;
        },
        finishedSteps: function() {
            if (
                this.sidebarCardsGrouped != 0 &&
                this.originalStack[0] && this.originalStack[0].list.length == this.sidebarCardsGrouped &&
                this.namedGroups.length == this.cardGroups.length
            ) return true;
            else return false;
        },
        activeSteps: function() {
            // check which steps are already satisfied and hide them
            // CHECK STEP 1 - if no group is created
            if (this.sidebarCardsGrouped == 0) {
                return this.getStepsByIndexes([0]);
            } // CHECK STEP 2 - if all cards were grouped
            else if (this.originalStack[0] && this.originalStack[0].list.length != this.sidebarCardsGrouped) {
                return this.getStepsByIndexes([1]);
            } // CHECK STEP 3 - if all groups are named
            else if (this.namedGroups.length != this.cardGroups.length ) {
                return this.getStepsByIndexes([2, 3]);
            } // CHECK STEP 4 - all done!
            else return this.getStepsByIndexes([3, 4]);
        },
    },
    methods: {
        setOriginalStack: function(g){
            let groups = g || this.stack.concat(this.groups);
            let stack = [{ list: [] }];
            groups.forEach((g) => stack[0].list = stack[0].list.concat(g.list));
            this.originalStack = stack;
        },
        getParameterByName: function (name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },
        shuffleArray: function (array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        },
        userNameText: function(text) {
            let name = this.authenticated && this.authenticated.userName ? this.authenticated.userName.split(" ")[0] : "";
            return text.replace("%userName", name);
        },
        connect: function() {
            window.localStorage.setItem("userName", this.authenticated.userName);
            this.getSpreadsheetCards();
        },
        refresh: function(){
            window.location.reload();
        },
        getStepsByIndexes: function(arr) {
            return arr.map((i) => this.texts.steps[i]);
        },
        getStepsHtml: function(steps){
            let html = `<div class="app-step">`;
            html += steps.map((step) => {
                return step.title.map((t) => `<h2 class="app-step__title">${this.userNameText(t)}</h2>`) +
                    `<div class="app-step__text">` +
                        step.text.map((t) => `<p>${this.userNameText(t)}</p>`).join("") +
                    `</div>`
            }).join("");
            html += `</div>`;
            return html;
        },
        showSimpleAlert: function(alert){
            this.alert = {
                open: true,
                title: [alert.title],
                text: [alert.text],
                buttons: this.texts.alerts.generic.buttons,
            };
        },
        alertSteps: function(){
            let html = this.getStepsHtml(this.texts.steps);
            this.alert = {
                open: true,
                title: this.texts.alerts.steps.title,
                textHtml: html,
                buttons: this.texts.alerts.steps.buttons,
                style: {
                    maxWidth: "800px"
                },
            };
        },
        closeAlert: function(){ this.alert.open = false },
        finish: function() {
            if(!this.finishedSteps){
                html = `<p>${this.texts.stepsRemainingText}</p>` + this.getStepsHtml(this.activeSteps);
                this.alert = {
                    open: true,
                    title: this.texts.stepsRemainingTitle,
                    textHtml: html,
                    buttons: this.texts.alerts.steps.buttons,
                    style: {
                        maxWidth: "800px"
                    },
                };

            } else this.saveToSheets();
        },
        getSpreadsheetCards: function(){
            if(!this.getParameterByName("gs")){
                return this.alert = {
                    open: true,
                    title: this.texts.alerts.noKeys.title,
                    text: this.texts.alerts.noKeys.text,
                    buttons: this.texts.alerts.noKeys.buttons,
                };
            };

            this.loading = true;

            var req = new XMLHttpRequest();
            req.open("GET", `${this.SCRIPT_URL}?type=getCards`, true); // whether to make async call
            req.responseType = "json";
            req.onreadystatechange = (evt) => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        // SUCCESS
                        var cards = req.response.status == "success" ? req.response.result : [];
                        console.log("Cards loaded: ", req.response);

                        // shuffle cards so we avoid bias due to writing the list spontaneously
                        let original = this.shuffleArray(cards).map((cell, i) => {
                            return {
                                id: i+1,
                                name: cell[0],
                                info: cell[1],
                            };
                        });

                        this.stack[0].list = original;
                        this.groups = this.getGroupGaps([]);
                        this.setOriginalStack();

                        let userName = this.texts.anonymousLabel.join(" ");

                        // redirect when loading the first time
                        this.started = true;

                        // console.log(req.responseText)
                    } else {
                        // ERROR
                        console.log(JSON.stringify(req, null, 2));
                        this.alert = {
                            open: true,
                            title: this.texts.alerts.noSheet.title,
                            text: this.texts.alerts.noSheet.text,
                            buttons: this.texts.alerts.noSheet.buttons
                        };
                    }
                }
                this.loading = false;
            };
            req.send();
        },
        saveToSheets: function() {
            this.loading = true;
            let id = (Date.parse(new Date).toString());
            let date = `${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()}`;

            let groups = this.cardGroups;
            let rows = groups.map((l, i)=>{
                // first the cluster name
                let row = [l.title];
                // then the cards by ther indexes
                l.list.forEach((item, index) => row.push(item.name));
                return row;
            });
            rows.forEach((row) => {
                row.splice(0, 0, id );
                row.splice(1, 0, date );
                row.splice(2, 0, this.authenticated.userName);
            });
            var req = new XMLHttpRequest();
            req.open("POST", `${this.SCRIPT_URL}`, true); // whether to make async call
            req.responseType = "json";
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            req.onreadystatechange = (evt) => {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        // SUCCESS
                        console.log("Saved: ", req.response);
                        this.completed = true;
                    } else {
                        // ERROR
                        console.log(JSON.stringify(req.response, null, 2));
                        this.alert = {
                            open: true,
                            title: this.texts.alerts.saveFail.title,
                            text: this.texts.alerts.saveFail.text,
                            buttons: this.texts.alerts.saveFail.buttons
                        };
                    }
                }
                this.loading = false;
            };
            req.send(`type=write&values=${encodeURIComponent(JSON.stringify(rows))}`);
        },
        // drag library by vddl-draggable (thanks hejianxian!)
        // http://hejx.space/vddl/#/component/vddl-draggable
        // https://github.com/hejianxian/vddl/blob/master/example/src/views/horizontal.vue
        handleDragstart() {
            this.dragging = true;
        },
        handleDragend() {
            this.dragging = false;
        },
        clearClasses: function(){
            // prevents vddl bugs while moving cards
            let sel = document.querySelectorAll(".vddl-dragging.vddl-dragging-source");
            for(var i = 0; i < sel.length - 1; i++){
                sel[i].classList.remove("vddl-dragging","vddl-dragging-source")
            }
        },
        getCardGroups: function(_list){
            let list = _list || this.groups;
            // prepare for applying gaps
            let rawGroups = list.slice(0)
                .filter((g)=>g.list && g.list.length)
            return rawGroups;
        },
        getGroupGaps: function(list) {
            // prepare for applying gaps
            let rawGroups = this.getCardGroups(list);
            let id = 1;
            // first item is a gap
            let groups = [ { id: id, list: [] } ];
            // add groups and gaps after
            rawGroups.forEach((gg, index) => {
                id += 1;
                let g = { id: id, list: gg.list.splice(0), title: gg.title || "" }
                id += 1;
                let gap = { id: id, list: [] };
                groups.push(g);
                groups.push(gap);
            });
            return groups;
        },
        groupMoved: function (item) {
            // remove dragged item at index
            let { index, list } = item;
            let _list = JSON.parse(JSON.stringify(list));
            _list.splice(index, 1);

            // apply gaps if card sorting is of type="open"
            if(this.activityType=="open"){
                this.groups = this.getGroupGaps(_list);
            }
            this.clearClasses();
        },
        cardMoved: function(item){
            let { index, list } = item;
            list.splice(index, 1);

            // apply gaps if card sorting is of type="open"
            if(this.activityType=="open"){
                this.groups = this.getGroupGaps(this.groups);
            }
            this.clearClasses();
        },
        deleteGroup: function(group, index) {
            // get items from the list and push them to original list (sidebar)
            let items = this.groups[index].list.filter((i) => i.name);
            items.forEach((item) => this.stack[0].list.push(item));

            this.groups.splice(index, 1);
            return this.groups = this.getGroupGaps();
        },
    }
})
