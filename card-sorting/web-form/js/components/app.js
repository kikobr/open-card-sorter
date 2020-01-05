// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var app = new Vue({
    el: '#app',
    components: ["app-intro", "app-card", "app-ending"],
    props: {
        texts: {
            type: Object,
            default: window.texts
        }
    },
    data: {
        gapiConnected: false,
        authenticated: false,
        queueStart: false,
        started: false,
        completed: false,
        CLIENT_ID: null,
        API_KEY: null,
        SPREADHSEET_ID: null,
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
        this.CLIENT_ID = this.getParameterByName("CLIENT_ID");
        this.API_KEY = this.getParameterByName("API_KEY");
        this.SPREADHSEET_ID = this.getParameterByName("SPREADHSEET_ID");

        // this.CLIENT_ID = '960421396712-pkvai2kt20mtlfmeot5505glp5hp81pf.apps.googleusercontent.com';
        // this.API_KEY = 'AIzaSyBBIDXg1as2Z3iwqD_O9gCFAaFkMWp3Jgw';
        // this.SPREADHSEET_ID = '1UHWW1V9tvfjfIAD3s0nOY0p8UERse2VfRoH04JN-SRQ';
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
        authenticate: function() {
            // manual connection
            if (this.authenticated) this.started = true;
            else {
                this.queueStart = true;
                gapi.auth2.getAuthInstance().signIn();
            }
        },
        disconnect: function() {
            gapi.auth2.getAuthInstance().signOut();
        },
        loadGapi: function() {
            gapi.load('client:auth2', this.initGapiClient);
        },
        initGapiClient: function() {
            gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            }).then(() => {
                this.gapiConnected = true;
                // Listen for sign-in state changes
                gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
                // Handle the initial sign-in state
                this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            }, function(error) {
                console.log(JSON.stringify(error, null, 2));
            });
        },
        updateSigninStatus: function(isSignedIn) {
            if (isSignedIn) {

                // get list of cards
                this.getSpreadsheetCards();

                let userName = this.texts.anonymousLabel.join(" ");
                try {
                    userName = gapi.auth2.getAuthInstance().currentUser.Ab.w3.ig;
                } catch (err) {
                    console.log(err);
                }
                this.authenticated = {
                    userName: userName
                };
                // redirect when connecting the first time
                if (this.queueStart) {
                    this.started = true;
                    this.queueStart = false;
                }
            } else {
                this.authenticated = false;
            }
        },
        getSpreadsheetCards: async function(){
            var params = {
                // The ID of the spreadsheet to update.
                spreadsheetId: this.SPREADHSEET_ID,
                range: `1. Setup!A2:A`,
                valueRenderOption: 'FORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING',
            };
            var request = gapi.client.sheets.spreadsheets.values.get(params);
            return request.then((response) => {
                // shuffle cards so we avoid bias due to writing the list spontaneously
                let original = this.shuffleArray(response.result.values).map((cell, i) => {
                    return {
                        name: cell[0],
                        id: i+1
                    };
                });
                this.original = this.original.concat(original);
                this.originalUntouched = this.original.filter((o) => o.name).slice(0);
            }, (reason) => {
                console.error('error: ' + reason.result.error.message);
            });
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
            // this.completed = true;
        },
        saveToSheets: function() {

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

            var params = {
                // The ID of the spreadsheet to update.
                spreadsheetId: this.SPREADHSEET_ID, // TODO: Update placeholder value.
                // The A1 notation of the values to update.
                range: `Forms!A1:A`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
            };

            var valueRangeBody = {
                "majorDimension": 'ROWS',
                "values": items,
            };

            var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);

            request.then((response) =>{
                // TODO: Change code below to process the `response` object:
                console.log(response.result);
                this.completed = true;
            }, (reason) => {
                console.error('error: ' + reason.result.error.message);
            });

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
