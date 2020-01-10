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
        loading: false,
        authenticated: {
            userName: null,
        },
        queueStart: false,
        started: false,
        completed: false,
        SCRIPT_URL: null,
        original: [
            {
                title: "Deck"
            },
        ],
        originalUntouched: null,
        lists: [],
        hoverClass: "col-ghost--hover",
        animateStep: true,
    },
    created: function(){
        // this.SCRIPT_URL = `https://script.google.com/macros/s/${ this.getParameterByName("gs") }/dev`;
        this.SCRIPT_URL = `https://script.google.com/macros/s/${ this.getParameterByName("gs") }/exec`;

        this.authenticated.userName = window.localStorage.getItem("userName") || this.authenticated.userName;
        // this.getSpreadsheetCards();
    },
    beforeMount: function() {
        document.title = this.texts.appTitle.join(" ");
        // gapi.load('client:auth2', this.initGapiClient);
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
            let allCards = this.originalUntouched ? this.originalUntouched.length : 0;
            let sidebarCardsRemaining = this.original.filter((o) => o.name).length;
            return allCards - sidebarCardsRemaining;
        },
        groupedCardsCounter: function() {
            let text = this.texts.sidebarSubtitle[0];
            let split = text.split("%n");
            let allCards = this.originalUntouched ? this.originalUntouched.length : 0;
            text = `<strong>${this.sidebarCardsGrouped}</strong>${split[1]}${allCards}${split[2]}`
            return text;
        },
        namedGroups: function() {
            return this.lists.filter((l) => l[0].title);
        },
        finishedSteps: function() {
            if (
                this.sidebarCardsGrouped != 0 &&
                this.originalUntouched && this.originalUntouched.length == this.sidebarCardsGrouped &&
                this.namedGroups.length == this.lists.length
            ) return true;
            else return false;
        },
        activeSteps: function() {
            // check which steps are already satisfied and hide them
            // CHECK STEP 1 - if no group is created
            if (this.sidebarCardsGrouped == 0) {
                return this.getStepsByIndexes([0]);
            } // CHECK STEP 2 - if all cards were grouped
            else if (this.originalUntouched && this.originalUntouched.length != this.sidebarCardsGrouped) {
                return this.getStepsByIndexes([1]);
            } // CHECK STEP 3 - if all groups are named
            else if (this.namedGroups.length != this.lists.length) {
                return this.getStepsByIndexes([2, 3]);
            } // CHECK STEP 4 - all done!
            else return this.getStepsByIndexes([3, 4]);
        },
    },
    methods: {
        closeAlert: function(){ this.alert.open = false },
        refresh: function(){
            window.location.reload();
        },
        connect: function() {
            window.localStorage.setItem("userName", this.authenticated.userName);
            this.getSpreadsheetCards();
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
                        this.original = [this.original[0]].concat(original);
                        this.originalUntouched = this.original.filter((o) => o.name).slice(0);

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

            let items = this.lists.map((l, i)=>{
                return l.map((item, index) => {
                    if(index == 0) return item.title;
                    else return item.name;
                });
            });
            items.forEach((item) => {
                item.splice(0, 0, id );
                item.splice(1, 0, date );
                item.splice(2, 0, this.authenticated.userName);
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
            req.send(`type=write&values=${encodeURIComponent(JSON.stringify(items))}`);
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
        removeEmptyLists: function() {
            this.lists.forEach((l, index) => {
                // consider index + 1 since the first item is always the column's title
                if (l.length <= 1) this.lists.splice(index, 1);
            });
        },
        getStepsByIndexes: function(arr) {
            return arr.map((i) => this.texts.steps[i]);
        },
        alertSteps: function(){
            let html = `<div class="app-step">`;
            html += this.texts.steps.map((step) => {
                return step.title.map((t) => `<h2 class="app-step__title">${this.userNameText(t)}</h2>`) +
                    `<div class="app-step__text">` +
                        step.text.map((t) => `<p>${this.userNameText(t)}</p>`).join("") +
                    `</div>`
            }).join("");
            html += `</div>`;

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
        userNameText: function(text) {
            let name = this.authenticated && this.authenticated.userName ? this.authenticated.userName.split(" ")[0] : "";
            return text.replace("%userName", name);
        },
        clearGhostClasses: function() {
            document.querySelectorAll(".col-ghost").forEach((col) => {
                col.classList.remove(this.hoverClass);
            });
        },
        deleteGroup: function(list) {
            // find real list index, since listWithGaps messes our indexes
            let listIndex;
            this.lists.forEach((l, i) => {
                if (JSON.stringify(l) == JSON.stringify(list)) listIndex = i;
            });
            // get items from the list and push them to original list (sidebar)
            let items = this.lists[listIndex].filter((i) => i.name);
            items.forEach((item) => this.original.push(item));
            // delete list
            this.lists.splice(listIndex, 1);
        },
        onMove: function(evt) {
            /*
             * Check if its moving inside an empty (ghost) column.
             * If so, change classes to display instructions. I had to getAuthInstance
             * since Vue.Draggable overrides mouse events and :hover won't work.
             */
            let to = evt.to.querySelectorAll(".list-group-item:not(.sortable-ghost)");
            this.clearGhostClasses();
            // empty column are considered "ghost columns"
            if (to.length == 0) {
                evt.to.closest(".col-group").classList.add(this.hoverClass);
            }
        },
        onChange: function(evt, list, index) {
            this.clearGhostClasses();
            let size = list.length;

            // move to this.lists when adding a new group
            if (evt.added && size == 1) {
                // since our computed list is compound of empty lists as "drop" areas,
                // we need to ignore them when finding the index at which we'll add the new entry
                // it's ugly but i couldn't get any better idea :/
                let listIndex = 0;
                let foundListIndex = false;
                this.listsWithGaps.forEach((l, i) => {
                    if (i == index) foundListIndex = true;
                    if (!foundListIndex && l.length) listIndex++;
                });

                let newList = list.splice(0);
                newList.splice(0, 0, {
                    title: ""
                }); // title first column
                this.lists.splice(listIndex, 0, newList);
            }
            this.removeEmptyLists();
        },
        finish: function() {
            this.saveToSheets();
        },
        getParameterByName: function (name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }
    }
})
