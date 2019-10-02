console.log("sainty");

(function() {
    Vue.component("image-modal", {
        //data, methods, mounted
        template: "#image-modal-template",
        props: ["image_id"],
        watch: {
            image_id: function() {
                // console.log("THIS INSIDE COMPONENT", this);
                var me = this;
                axios
                    .get("/imagedata/" + this.image_id)
                    .then(function(response) {
                        // console.log("IN THEN ME.Data ", me.image);

                        if (response.data[0].length == 0) {
                            // console.log(response.data[0]);
                            me.closeModal();
                        } else {
                            me.image = response.data[0][0];
                            me.comments = response.data[1];
                            me.image.created_at = parseDate(
                                response.data[0][0].created_at
                            );

                            me.comments.map(function(comment) {
                                // console.log()
                                comment.created_at = parseDate(
                                    comment.created_at
                                );
                            });
                            me.showErrorMod = false;
                            if (!me.image.nextid) {
                                me.showNext = false;
                            } else {
                                me.showNext = true;
                            }
                            if (!me.image.previd) {
                                me.showPrev = false;
                            } else {
                                me.showPrev = true;
                            }
                        }
                    });
            }
        },
        data: function() {
            return {
                image: {},
                form: { comment: "", username: "" },
                comments: [],
                showNext: true,
                showPrev: true,
                showSure: false
                // showErrorMod: false
            };
        },

        mounted: function() {
            console.log("THIS INSIDE COMPONENT", this);
            var me = this;
            axios.get("/imagedata/" + this.image_id).then(function(response) {
                // console.log("IN THEN ME.Data ", me.image);

                if (response.data[0].length == 0) {
                    console.log(response.data[0]);
                    me.closeModal();
                } else {
                    me.image = response.data[0][0];
                    me.comments = response.data[1];
                    me.image.created_at = parseDate(
                        response.data[0][0].created_at
                    );
                    me.comments.map(function(comment) {
                        // console.log()
                        comment.created_at = parseDate(comment.created_at);
                    });
                    console.log("PREVIOUS", me.image.previd);
                    console.log("NEXT", me.image.nextid);
                    if (!me.image.nextid) {
                        me.showNext = false;
                    } else {
                        me.showNext = true;
                    }
                    if (!me.image.previd) {
                        me.showPrev = false;
                    } else {
                        me.showPrev = true;
                    }
                    // // console.log("response.data", response.data);
                    // console.log("COMMENTS", me.comments);
                }
            });
            console.log("IMAGE ID INSIDE COMPONENT", this.image_id);
        },
        methods: {
            myClick: function() {
                console.log("myClick running");
            },
            closeModal: function() {
                // when user clicks on the x
                console.log("Clicked on x");

                this.$emit("close");
            },
            postcomment: function(e) {
                e.preventDefault();
                // console.log("this POSTED COMMENT: ", this);
                // // this.comment=
                // console.log("FORM OF THIS", this.form);
                var data = {
                    comment: this.form.comment,
                    username: this.form.username,
                    image_id: this.image.id
                };
                var me = this;
                axios
                    .post("/comments", data)
                    .then(function(response) {
                        console.log(
                            "response from post upload ",
                            response.data
                        );
                        // var img = response.data[0];

                        var comment = response.data[0];
                        me.comments.unshift(comment);
                        me.comments[0].created_at = parseDate(
                            response.data[0].created_at
                        );
                        me.form.comment = "";
                        me.form.username = "";
                        // me.showErrorMod = false;
                    })
                    .catch(error => {
                        console.log("error in post", error);
                        // me.showErrorMod = true;
                    });
            },
            deletePicOnChild: function() {
                this.$emit("deletepic");
            },
            showPrevFunc: function() {
                console.log("IM IN PREV");
                console.log("IMAGE", this.image);
                location.hash = "#" + this.image.previd;
                // this.image_id=this.image.prevID
            },
            showNextFunc: function() {
                console.log("IM IN NEXT");
                location.hash = "#" + this.image.nextid;
            },
            closeSureFunc: function() {
                this.showSure = false;
            },
            showSureFunc: function() {
                this.showSure = true;
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            showButton: true,
            images: [],
            image_id: location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            showError: false
        },
        mounted: function() {
            console.log("My vue has mounted");
            var me = this;
            addEventListener("hashchange", () => {
                console.log(location.hash);
                if (
                    location.hash.slice(1) != "" &&
                    !isNaN(location.hash.slice(1))
                ) {
                    this.image_id = location.hash.slice(1);
                } else {
                    this.closeModalOnParent();
                    // history.pushstate({}, "", "/");
                }
            });

            axios.get("/images").then(function(response) {
                console.log("IN THEN ME.Data ", me.images);

                me.images = response.data;
            });
        },
        methods: {
            closeModalOnParent: function() {
                console.log("We are getting to the parent to close");
                location.hash = "";
                this.image_id = "";
                this.showError = false;
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;

                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        console.log("response from post upload ", response);
                        // var img = response.data[0];
                        var img = {
                            title: response.data[0].title,
                            username: response.data[0].username,
                            description: response.data[0].description,
                            url: response.data[0].url,
                            id: response.data[0].id
                        };
                        me.images.unshift(img);
                        me.title = "";
                        me.description = "";
                        me.username = "";
                        me.file = null;
                        me.showError = false;
                    })
                    .catch(error => {
                        console.log("error in post", error);
                        me.showError = true;
                    });
            },
            handleChange: function(e) {
                // console.log("Handle change is runnning");
                // console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },
            moreimages: function(e) {
                e.preventDefault();
                // console.log(this.images[7].id);
                var currLowestId = this.images[this.images.length - 1].id;
                var me = this;
                axios
                    .get("/moreimages/" + currLowestId)
                    .then(function(response) {
                        console.log("GOT more IMAGES", response.data);

                        me.images.push(...response.data);
                        var currLowestId = me.images[me.images.length - 1].id;
                        var genLowestId = response.data[0].lowestId;
                        // console.log("GENERAL LOWEST ID", genLowestId);
                        // console.log("CURRENT LOWEST ID", currLowestId);
                        if (currLowestId == genLowestId) {
                            me.showButton = false;
                        }
                    });
            },
            deletePicOnParent: function() {
                var me = this;
                // console.log("IMAGE ID FINDING", location.hash.slice(1));
                axios
                    .get("/delete/" + location.hash.slice(1))
                    .then(function(response) {
                        console.log("IMAGE_ID", me.image_id);
                        console.log("LAST IMAGE ID", me.images[0].id);
                        me.images = me.images.filter(function(image) {
                            return image.id != me.image_id;
                        });
                        console.log("ME IMAGES ID", me.images);
                        // me.images = me.images.filter(function(image) {
                        //     return image.id !== 30;
                        // });
                        // console.log("CURRENT IMAGE IN ARRAY", currentImg);
                        me.closeModalOnParent();
                    })
                    .catch(error => {
                        console.log("error in delete", error);
                    });
            }
        }
    });

    function parseDate(created_at) {
        var date = new Date(Date.parse(created_at));
        var user_date = new Date();
        var diff = Math.floor((user_date - date) / 1000);
        if (diff <= 1) {
            return "just now";
        }
        if (diff < 20) {
            return diff + " seconds ago";
        }
        if (diff < 40) {
            return "half a minute ago";
        }
        if (diff < 60) {
            return "less than a minute ago";
        }
        if (diff <= 90) {
            return "one minute ago";
        }
        if (diff <= 3540) {
            return Math.round(diff / 60) + " minutes ago";
        }
        if (diff <= 5400) {
            return "1 hour ago";
        }
        if (diff <= 86400) {
            return Math.round(diff / 3600) + " hours ago";
        }
        if (diff <= 129600) {
            return "1 day ago";
        }
        if (diff < 604800) {
            return Math.round(diff / 86400) + " days ago";
        }
        if (diff <= 777600) {
            return "1 week ago";
        }
        return "on " + date;
    }
})();
