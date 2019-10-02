console.log("sainty");

(function() {
    new Vue({
        el: "#main",
        data: {
            name: "another Spice",
            seen: true,
            planets: [],
            myClassName: "highlight"
        },
        mounted: function() {
            console.log("My vue has mounted");
            // this is the moment when you want get images, after the page is mounted
            console.log("planets is ", this.planets);
            var me = this;
            // me doesnt have to be me
            // this here is in a scope of vue and you put it into variable so you can get it into get
            // this.planets is global object with property planets that doesnt exist so its undefined
            // me.planets is empty array that we have in data
            // if i used arrow function, they remember this, but we cant use them in here
            axios.get("/planets").then(function(response) {
                console.log("IN THEN ME.PLANETS ", me.planets);
                // now im getting
                console.log("IN THEN this.planets", this.planets);
                console.log("This is my response!", response.data);
                me.planets = response.data;
            });
        },
        methods: {
            myFunction: function(planetName) {
                console.log("my function is running with", planetName);
            },
            myNextFunction: function() {
                console.log("my next function");
            }
        }
    });
})();
